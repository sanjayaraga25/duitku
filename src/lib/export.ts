import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { AppState, Transaction } from '../types';
import { formatDateID } from './date';
import { formatIDR } from './format';

function escapeCsvCell(value: string): string {
  const text = value ?? '';
  if (/[";\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function escapeHtml(value: string): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function txTypeLabel(type: Transaction['type']): string {
  if (type === 'income') return 'Pemasukan';
  if (type === 'expense') return 'Pengeluaran';
  return 'Transfer';
}

function sortedTransactions(state: AppState): Transaction[] {
  return [...state.transactions].sort((a, b) => {
    if (a.date === b.date) return b.createdAt.localeCompare(a.createdAt);
    return b.date.localeCompare(a.date);
  });
}

async function shareFile(uri: string, mimeType: string, UTI?: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType,
      UTI,
      dialogTitle: 'Bagikan laporan Duitku',
    });
  }
}

export async function exportCSV(state: AppState): Promise<void> {
  const header = ['Tanggal', 'Jenis', 'Kategori', 'Dompet', 'Dompet Tujuan', 'Catatan', 'Jumlah'];
  const rows = sortedTransactions(state).map((tx) => {
    const category = state.categories.find((c) => c.id === tx.categoryId);
    const wallet = state.wallets.find((w) => w.id === tx.walletId);
    const toWallet = state.wallets.find((w) => w.id === tx.toWalletId);
    return [
      tx.date,
      txTypeLabel(tx.type),
      category?.name ?? '-',
      wallet?.name ?? '-',
      toWallet?.name ?? '-',
      tx.note || '-',
      String(tx.amount),
    ]
      .map(escapeCsvCell)
      .join(';');
  });

  const csv = `\uFEFF${[header.join(';'), ...rows].join('\r\n')}`;
  const file = new File(Paths.cache, `duitku-transaksi-${Date.now()}.csv`);
  if (!file.exists) file.create();
  await file.write(csv);
  await shareFile(file.uri, 'text/csv', 'public.comma-separated-values-text');
}

function buildReportHtml(state: AppState): string {
  const transactions = sortedTransactions(state);
  const income = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const rowsHtml = transactions
    .map((tx) => {
      const category = state.categories.find((c) => c.id === tx.categoryId);
      const wallet = state.wallets.find((w) => w.id === tx.walletId);
      const toWallet = state.wallets.find((w) => w.id === tx.toWalletId);
      const walletLabel = toWallet ? `${wallet?.name ?? '-'} → ${toWallet.name}` : wallet?.name ?? '-';
      const amountClass = tx.type === 'income' ? 'income' : tx.type === 'expense' ? 'expense' : '';
      const prefix = tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '';
      return `<tr>
        <td>${formatDateID(tx.date)}</td>
        <td>${escapeHtml(txTypeLabel(tx.type))}</td>
        <td>${escapeHtml(category?.name ?? '-')}</td>
        <td>${escapeHtml(walletLabel)}</td>
        <td>${escapeHtml(tx.note || '-')}</td>
        <td class="amount ${amountClass}">${prefix}${formatIDR(tx.amount)}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  @page { margin: 28px; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0B1B33; margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 18px; border-bottom: 2px solid #4F46E5; }
  .brand { font-size: 24px; font-weight: 800; color: #4F46E5; letter-spacing: -0.5px; }
  .brand small { display: block; font-size: 11px; font-weight: 500; color: #6B7A90; letter-spacing: 0; margin-top: 3px; }
  .meta { font-size: 11px; color: #6B7A90; text-align: right; line-height: 1.6; }
  .cards { display: flex; gap: 10px; margin: 20px 0 24px; }
  .card { flex: 1; border: 1px solid #E8EDF4; border-radius: 12px; padding: 12px 14px; background: #F8FAFD; }
  .card span { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: #6B7A90; }
  .card strong { display: block; font-size: 16px; margin-top: 5px; }
  .income { color: #0EA66B; }
  .expense { color: #E5484D; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  th { text-align: left; background: #EEF0FF; color: #3B32C9; padding: 8px 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
  td { padding: 7px 6px; border-bottom: 1px solid #E8EDF4; vertical-align: top; }
  td.amount { text-align: right; white-space: nowrap; font-weight: 700; }
  .footer { margin-top: 20px; font-size: 9.5px; color: #9AA7B8; text-align: center; }
  .empty { text-align: center; color: #9AA7B8; padding: 30px 0; font-size: 12px; }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">Duitku<small>Laporan Keuangan Pribadi</small></div>
    <div class="meta">Dibuat ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>${transactions.length} transaksi</div>
  </div>
  <div class="cards">
    <div class="card"><span>Total Pemasukan</span><strong class="income">${formatIDR(income)}</strong></div>
    <div class="card"><span>Total Pengeluaran</span><strong class="expense">${formatIDR(expense)}</strong></div>
    <div class="card"><span>Selisih</span><strong>${formatIDR(income - expense)}</strong></div>
  </div>
  ${
    transactions.length === 0
      ? '<div class="empty">Belum ada transaksi untuk dilaporkan.</div>'
      : `<table>
          <thead><tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Dompet</th><th>Catatan</th><th style="text-align:right">Jumlah</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>`
  }
  <div class="footer">Duitku &middot; Laporan dihasilkan otomatis dari aplikasi</div>
</body>
</html>`;
}

export async function exportPDF(state: AppState): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: buildReportHtml(state) });
  await shareFile(uri, 'application/pdf', 'com.adobe.pdf');
}
