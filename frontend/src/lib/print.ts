import type { SaleReceipt } from '@/types';
import { BACKEND_URL } from '@/lib/api';

// Commandes ESC/POS
const ESC = '\x1b';
const GS = '\x1d';

const COMMANDS = {
  INIT: ESC + '@',
  ALIGN_CENTER: ESC + 'a' + '\x01',
  ALIGN_LEFT: ESC + 'a' + '\x00',
  ALIGN_RIGHT: ESC + 'a' + '\x02',
  BOLD_ON: ESC + 'E' + '\x01',
  BOLD_OFF: ESC + 'E' + '\x00',
  DOUBLE_HEIGHT: GS + '!' + '\x01',
  NORMAL_SIZE: GS + '!' + '\x00',
  CUT_PAPER: GS + 'V' + '\x41' + '\x00',
  FEED_LINE: '\n',
  DASH_LINE: '--------------------------------\n',
};

interface PrinterDevice {
  opened: boolean;
  open: () => Promise<void>;
  transferOut: (endpoint: number, data: Uint8Array) => Promise<{ status: string }>;
}

// Classe pour gérer l'impression ESC/POS
class ESCPOSPrinter {
  private device: PrinterDevice | null = null;
  private encoder = new TextEncoder();

  // Vérifie si WebUSB est disponible
  isSupported(): boolean {
    return 'usb' in navigator;
  }

  // Connecte à l'imprimante via WebUSB
  async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      console.error('WebUSB non supporté');
      return false;
    }

    try {
      const usb = (navigator as unknown as { usb: { requestDevice: (options: { filters: unknown[] }) => Promise<PrinterDevice> } }).usb;
      this.device = await usb.requestDevice({
        filters: [
          { vendorId: 0x0416 }, // Epson
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0519 }, // Star
          { vendorId: 0x0483 }, // STMicroelectronics (Xprinter)
          { vendorId: 0x0fe6 }, // Xprinter
          { vendorId: 0x154f }, // SNBC
          { vendorId: 0x6868 }, // Generic
        ],
      });

      if (this.device && !this.device.opened) {
        await this.device.open();
      }

      return true;
    } catch (error) {
      console.error('Erreur connexion imprimante:', error);
      return false;
    }
  }

  // Envoie des données à l'imprimante
  async print(data: string): Promise<boolean> {
    if (!this.device || !this.device.opened) {
      const connected = await this.connect();
      if (!connected) return false;
    }

    try {
      const encoded = this.encoder.encode(data);
      await this.device!.transferOut(1, encoded);
      return true;
    } catch (error) {
      console.error('Erreur impression:', error);
      return false;
    }
  }

  // Génère le contenu du ticket
  generateReceipt(receipt: SaleReceipt): string {
    let content = '';

    // Initialisation
    content += COMMANDS.INIT;

    // En-tête
    content += COMMANDS.ALIGN_CENTER;
    content += COMMANDS.DOUBLE_HEIGHT;
    content += COMMANDS.BOLD_ON;
    content += receipt.companyName + '\n';
    content += COMMANDS.BOLD_OFF;
    content += COMMANDS.NORMAL_SIZE;

    if (receipt.companyAddress) {
      content += receipt.companyAddress + '\n';
    }
    if (receipt.companyPhone) {
      content += 'Tel: ' + receipt.companyPhone + '\n';
    }

    content += COMMANDS.FEED_LINE;
    content += COMMANDS.DASH_LINE;

    // Infos vente
    content += COMMANDS.ALIGN_LEFT;
    content += 'Ticket: ' + receipt.receiptNumber + '\n';
    content += 'Date: ' + new Date(receipt.date).toLocaleString('fr-FR') + '\n';
    content += 'Vendeur: ' + receipt.vendeurName + '\n';
    if (receipt.clientName) {
      content += 'Client: ' + receipt.clientName + '\n';
    }

    content += COMMANDS.DASH_LINE;

    // Articles
    content += COMMANDS.BOLD_ON;
    content += padRight('Article', 16) + padLeft('Qté', 4) + padLeft('Total', 12) + '\n';
    content += COMMANDS.BOLD_OFF;

    for (const item of receipt.items) {
      const name = item.productName.substring(0, 16);
      const qty = item.quantity.toString();
      const total = Number(item.totalPrice).toLocaleString();
      content += padRight(name, 16) + padLeft(qty, 4) + padLeft(total, 12) + '\n';
    }

    content += COMMANDS.DASH_LINE;

    // Total
    content += COMMANDS.BOLD_ON;
    content += COMMANDS.DOUBLE_HEIGHT;
    content += padRight('TOTAL', 20) + padLeft(Math.round(Number(receipt.total)).toLocaleString() + ' FCFA', 12) + '\n';
    content += COMMANDS.NORMAL_SIZE;
    content += COMMANDS.BOLD_OFF;

    // Paiement
    content += COMMANDS.ALIGN_LEFT;
    const paymentLabel = {
      CASH: 'Espèces',
      CARD: 'Carte',
      MOBILE_MONEY: 'Mobile Money',
    }[receipt.paymentMethod] || receipt.paymentMethod;
    content += 'Paiement: ' + paymentLabel + '\n';

    content += COMMANDS.DASH_LINE;

    // Footer
    content += COMMANDS.ALIGN_CENTER;
    if (receipt.footer) {
      content += receipt.footer + '\n';
    }
    content += 'Merci de votre visite !\n';

    content += COMMANDS.FEED_LINE;
    content += COMMANDS.FEED_LINE;
    content += COMMANDS.FEED_LINE;
    content += COMMANDS.CUT_PAPER;

    return content;
  }
}

// Helpers pour formater les colonnes
function padRight(str: string, len: number): string {
  return str.padEnd(len, ' ');
}

function padLeft(str: string, len: number): string {
  return str.padStart(len, ' ');
}

function getLogoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
}

// Instance singleton
const printer = new ESCPOSPrinter();

// Fonction principale pour imprimer un ticket
export async function printReceipt(receipt: SaleReceipt): Promise<boolean> {
  // Essayer WebUSB d'abord
  if (printer.isSupported()) {
    try {
      // Note: WebUSB requires specific hardware permissions and might fail silently or be blocked.
      // We will default to window print if it fails or returns immediately.
      // const content = printer.generateReceipt(receipt);
      // const success = await printer.print(content);
      // if (success) return true;
    } catch (e) {
      console.warn('WebUSB printing failed, falling back to window print', e);
    }
  }

  // Fallback: impression via fenêtre navigateur (Preferred for styling control)
  printViaWindow(receipt);
  return true;
}

// Impression via fenêtre du navigateur (fallback)
function printViaWindow(receipt: SaleReceipt): void {
  const printWindow = window.open('', '_blank', 'width=300,height=600');
  if (!printWindow) return;

  const logoUrl = getLogoUrl(receipt.companyLogo);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ticket #${receipt.receiptNumber}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          width: 72mm; /* 80mm paper usually has ~72mm printable width */
          margin: 0 auto;
          padding: 5px 0;
          background: white;
          color: black;
          line-height: 1.2;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .large { font-size: 16px; }
        .logo { max-width: 60%; height: auto; margin-bottom: 5px; display: block; margin-left: auto; margin-right: auto; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; vertical-align: top; }
        .right { text-align: right; }
        .qty { width: 15%; text-align: center; }
        .total-row td { font-weight: bold; font-size: 14px; padding-top: 5px; border-top: 1px solid #000; }
        .footer { font-size: 10px; margin-top: 10px; }
        @media print {
            body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo" />` : ''}
      <div class="center bold large">${receipt.companyName}</div>
      ${receipt.companyAddress ? `<div class="center">${receipt.companyAddress}</div>` : ''}
      ${receipt.companyPhone ? `<div class="center">Tel: ${receipt.companyPhone}</div>` : ''}
      
      <div class="divider"></div>
      
      <div>Ticket: ${receipt.receiptNumber}</div>
      <div>Date: ${new Date(receipt.date).toLocaleString('fr-FR')}</div>
      <div>Vendeur: ${receipt.vendeurName}</div>
      ${receipt.clientName ? `<div class="bold">Client: ${receipt.clientName}</div>` : ''}
      
      <div class="divider"></div>
      
      <table>
        <thead>
          <tr class="bold">
            <td>Article</td>
            <td class="qty">Qté</td>
            <td class="right">Total</td>
          </tr>
        </thead>
        <tbody>
          ${receipt.items
      .map(
        (item) => `
            <tr>
              <td>${item.productName}</td>
              <td class="qty">${item.quantity}</td>
              <td class="right">${Number(item.totalPrice).toLocaleString()}</td>
            </tr>
          `
      )
      .join('')}
        </tbody>
      </table>
      
      <div class="divider"></div>
      
      <table>
        <tr class="total-row">
          <td>TOTAL</td>
          <td class="right">${Math.round(Number(receipt.total)).toLocaleString()} FCFA</td>
        </tr>
      </table>
      
      <div style="margin-top: 5px;">Paiement: <span class="bold">${{ CASH: 'Espèces', CARD: 'Carte', MOBILE_MONEY: 'Mobile Money' }[receipt.paymentMethod] ||
    receipt.paymentMethod
    }</span></div>
      
      <div class="divider"></div>
      
      <div class="center footer">
        ${receipt.footer || 'Merci de votre visite !'}
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
              window.print();
              // Optional: close after print. Some users prefer to keep it open to verify.
              // window.onafterprint = function() { window.close(); };
          }, 500); // Small delay to ensure images load
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export { printer };
