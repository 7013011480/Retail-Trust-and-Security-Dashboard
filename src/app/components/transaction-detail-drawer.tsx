import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import type { Transaction } from "@/lib/mock-data";

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  billData: any | null;
  open: boolean;
  onClose: () => void;
}

function riskBadgeClasses(level: string): string {
  switch (level) {
    case "High":
      return "bg-red-50 text-red-700 border border-red-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "Low":
      return "bg-green-50 text-green-700 border border-green-200";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200";
  }
}

function statusBadgeClasses(status: string): string {
  switch (status) {
    case "fraudulent":
      return "bg-red-50 text-red-700 border border-red-200";
    case "suspicious":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "genuine":
      return "bg-green-50 text-green-700 border border-green-200";
    case "pending":
      return "bg-gray-50 text-gray-600 border border-gray-200";
    default:
      return "bg-gray-50 text-gray-600 border border-gray-200";
  }
}

function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TransactionDetailDrawer({
  transaction,
  billData,
  open,
  onClose,
}: TransactionDetailDrawerProps) {
  if (!transaction) return null;

  const items: any[] = billData?.items ?? [];
  const payModes: any[] = billData?.payModes ?? [];
  const taxBreakup: any[] = billData?.taxBreakup ?? [];

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between pr-6">
            <SheetTitle className="text-blue-900 text-lg font-semibold">
              Transaction {transaction.id}
            </SheetTitle>
            {transaction.status && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClasses(transaction.status)}`}
              >
                {transaction.status}
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-6">
          {/* Store / POS / Camera info */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">
              Store &amp; Device Info
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Shop ID</dt>
                <dd className="font-medium text-gray-900">{transaction.shop_id}</dd>
              </div>
              <div>
                <dt className="text-gray-500">POS ID</dt>
                <dd className="font-medium text-gray-900">{transaction.pos_id}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Camera ID</dt>
                <dd className="font-medium text-gray-900">{transaction.cam_id}</dd>
              </div>
            </dl>
          </section>

          {/* Cashier + Timestamp */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">
              Cashier Details
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Cashier</dt>
                <dd className="font-medium text-gray-900">{transaction.cashier_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Timestamp</dt>
                <dd className="font-medium text-gray-900">
                  {formatTimestamp(transaction.timestamp)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Payment section */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">
              Payment
            </h3>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm text-gray-500">Total Amount</span>
              <span className="text-xl font-bold text-gray-900">
                {"\u20B9"}{transaction.transaction_total.toLocaleString("en-IN")}
              </span>
            </div>

            {payModes.length > 0 && (
              <div className="mb-3">
                <span className="text-sm text-gray-500">Payment Mode</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {payModes.map((pm: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200"
                    >
                      {pm.mode ?? pm.payModeName ?? pm.name ?? "Unknown"}{" "}
                      {(pm.amt ?? pm.amount) != null && (
                        <span className="ml-1 text-blue-500">
                          {"\u20B9"}{parseFloat(pm.amt ?? pm.amount).toLocaleString("en-IN")}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {taxBreakup.length > 0 && (
              <div className="rounded-md bg-gray-50 p-3">
                <span className="text-xs font-medium text-gray-500 uppercase">Tax Breakdown</span>
                <ul className="mt-1.5 space-y-1 text-sm">
                  {taxBreakup.map((tax: any, idx: number) => (
                    <li key={idx} className="flex justify-between text-gray-700">
                      <span>{tax.category ?? tax.taxName ?? tax.name ?? `Tax ${idx + 1}`}</span>
                      <span className="font-medium">
                        {"\u20B9"}{parseFloat(tax.taxAmt ?? tax.taxAmount ?? tax.amount ?? 0).toLocaleString("en-IN")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Items ordered */}
          {items.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Items Ordered ({items.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                      <th className="pb-2 pr-3">Item</th>
                      <th className="pb-2 pr-3 text-center">Qty</th>
                      <th className="pb-2 pr-3 text-right">Price</th>
                      <th className="pb-2 text-right">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item: any, idx: number) => (
                      <tr key={idx} className="text-gray-700">
                        <td className="py-2 pr-3 font-medium text-gray-900">
                          {item.itemName ?? item.name ?? "—"}
                        </td>
                        <td className="py-2 pr-3 text-center">
                          {item.qty ?? item.quantity ?? "—"}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          {"\u20B9"}
                          {parseFloat(item.totAmt ?? item.price ?? item.rate ?? item.amount ?? 0).toLocaleString(
                            "en-IN"
                          )}
                        </td>
                        <td className="py-2 text-right text-gray-500">
                          {item.category ?? item.deptName ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Risk assessment */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">
              Risk Assessment
            </h3>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm text-gray-500">Risk Level</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClasses(transaction.risk_level)}`}
              >
                {transaction.risk_level}
              </span>
            </div>

            {transaction.fraud_category && (
              <div className="mb-3 text-sm">
                <span className="text-gray-500">Fraud Category: </span>
                <span className="font-medium text-gray-900">{transaction.fraud_category}</span>
              </div>
            )}

            {transaction.triggered_rules && transaction.triggered_rules.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Triggered Rules</span>
                <ul className="mt-1.5 space-y-1">
                  {transaction.triggered_rules.map((rule, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700"
                    >
                      <span className="mt-0.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {transaction.notes && (
              <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                <span className="font-medium text-gray-700">Notes: </span>
                {transaction.notes}
              </div>
            )}
          </section>

          {/* Bill metadata */}
          {billData && (
            <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Bill Metadata
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {billData.billType != null && (
                  <div>
                    <dt className="text-gray-500">Bill Type</dt>
                    <dd className="font-medium text-gray-900">{billData.billType}</dd>
                  </div>
                )}
                {billData.billNo != null && (
                  <div>
                    <dt className="text-gray-500">Bill No</dt>
                    <dd className="font-medium text-gray-900">{billData.billNo}</dd>
                  </div>
                )}
                {billData.status != null && (
                  <div>
                    <dt className="text-gray-500">Bill Status</dt>
                    <dd className="font-medium text-gray-900">{billData.status}</dd>
                  </div>
                )}
                {billData.isComplementary != null && (
                  <div>
                    <dt className="text-gray-500">Complementary</dt>
                    <dd className="font-medium text-gray-900">
                      {billData.isComplementary ? (
                        <span className="text-amber-700">Yes</span>
                      ) : (
                        "No"
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
