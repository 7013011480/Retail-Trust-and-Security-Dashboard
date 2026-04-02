import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Video } from "lucide-react";
import type { Transaction } from "@/lib/mock-data";

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  billData: any | null;
  open: boolean;
  onClose: () => void;
}

function riskBadgeClasses(level: string): string {
  switch (level) {
    case "High": return "bg-red-50 text-red-700 border border-red-200";
    case "Medium": return "bg-amber-50 text-amber-700 border border-amber-200";
    case "Low": return "bg-green-50 text-green-700 border border-green-200";
    default: return "bg-gray-50 text-gray-700 border border-gray-200";
  }
}

function statusBadgeClasses(status: string): string {
  switch (status) {
    case "fraudulent": return "bg-red-50 text-red-700 border border-red-200";
    case "suspicious": return "bg-amber-50 text-amber-700 border border-amber-200";
    case "genuine": return "bg-green-50 text-green-700 border border-green-200";
    default: return "bg-gray-50 text-gray-600 border border-gray-200";
  }
}

export function TransactionDetailDrawer({ transaction, billData, open, onClose }: TransactionDetailDrawerProps) {
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
              {transaction.id}
            </SheetTitle>
            {transaction.status && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClasses(transaction.status)}`}>
                {transaction.status}
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-6">
          {/* Store & Device Info */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Store & Device Info</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Store</dt>
                <dd className="font-medium text-gray-900">{transaction.shop_name || transaction.shop_id}</dd>
                {transaction.shop_name && <dd className="text-xs text-gray-400 font-mono">{transaction.shop_id}</dd>}
              </div>
              <div>
                <dt className="text-gray-500">POS ID</dt>
                <dd className="font-medium text-gray-900">{transaction.pos_id}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Camera ID</dt>
                <dd className="font-medium text-gray-900">{transaction.cam_id}</dd>
              </div>
              {billData?.terminalName && (
                <div>
                  <dt className="text-gray-500">Terminal</dt>
                  <dd className="font-medium text-gray-900">{billData.terminalName}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Transaction Details */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Transaction Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Cashier</dt>
                <dd className="font-medium text-gray-900">{transaction.cashier_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Timestamp</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(transaction.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </dd>
              </div>
              {billData?.billNo && (
                <div>
                  <dt className="text-gray-500">Bill No</dt>
                  <dd className="font-medium text-gray-900">{billData.billNo}</dd>
                </div>
              )}
              {billData?.billType && (
                <div>
                  <dt className="text-gray-500">Bill Type</dt>
                  <dd className="font-medium text-gray-900">{billData.billType}</dd>
                </div>
              )}
              {billData?.tokenNum != null && billData.tokenNum > 0 && (
                <div>
                  <dt className="text-gray-500">Token No</dt>
                  <dd className="font-medium text-gray-900">{billData.tokenNum}</dd>
                </div>
              )}
              {billData?.status && (
                <div>
                  <dt className="text-gray-500">Bill Status</dt>
                  <dd className="font-medium text-gray-900">{billData.status}</dd>
                </div>
              )}
              {billData?.isComplementary && billData.isComplementary !== "No" && (
                <div>
                  <dt className="text-gray-500">Complementary</dt>
                  <dd className="font-medium text-amber-700">Yes</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Payment Section */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Payment</h3>

            <div className="grid grid-cols-3 gap-3 mb-3">
              {billData?.netSale != null && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Net Sale</span>
                  <p className="text-lg font-bold text-gray-900">{"\u20B9"}{parseFloat(billData.netSale).toLocaleString("en-IN")}</p>
                </div>
              )}
              {billData?.billAmt != null && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Bill Amount</span>
                  <p className="text-lg font-bold text-gray-900">{"\u20B9"}{parseFloat(billData.billAmt).toLocaleString("en-IN")}</p>
                </div>
              )}
              <div className="bg-blue-50 rounded-lg p-3">
                <span className="text-xs text-blue-600">Paid</span>
                <p className="text-lg font-bold text-blue-900">
                  {"\u20B9"}{payModes.length > 0
                    ? payModes.reduce((sum: number, pm: any) => sum + parseFloat(pm.amt ?? pm.amount ?? 0), 0).toLocaleString("en-IN")
                    : transaction.transaction_total.toLocaleString("en-IN")
                  }
                </p>
              </div>
            </div>

            {billData?.discAmt > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-amber-700">{"\u20B9"}{parseFloat(billData.discAmt).toLocaleString("en-IN")}</span>
              </div>
            )}
            {billData?.returnAmt > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Return Amount</span>
                <span className="font-medium text-red-700">{"\u20B9"}{parseFloat(billData.returnAmt).toLocaleString("en-IN")}</span>
              </div>
            )}
            {billData?.tipAmt > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Tip</span>
                <span className="font-medium text-green-700">{"\u20B9"}{parseFloat(billData.tipAmt).toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* Payment Modes */}
            {payModes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500 uppercase font-medium">Payment Mode</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {payModes.map((pm: any, idx: number) => (
                    <div key={idx} className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 border border-blue-200">
                      <span className="text-sm font-semibold text-blue-800 capitalize">{pm.mode ?? "Unknown"}</span>
                      <span className="text-sm text-blue-600">{"\u20B9"}{parseFloat(pm.amt ?? pm.amount ?? 0).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tax Breakdown */}
            {taxBreakup.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500 uppercase font-medium">Tax Breakdown</span>
                <div className="mt-2 space-y-1">
                  {taxBreakup.map((tax: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-700 bg-gray-50 rounded px-3 py-1.5">
                      <span>{tax.category ?? "Tax"} ({tax.tax ?? 0}%)</span>
                      <div className="text-right">
                        <span className="font-medium">{"\u20B9"}{parseFloat(tax.taxAmt ?? 0).toLocaleString("en-IN")}</span>
                        {(tax.cgst > 0 || tax.sgst > 0) && (
                          <span className="text-xs text-gray-400 ml-2">
                            CGST: {"\u20B9"}{tax.cgst} | SGST: {"\u20B9"}{tax.sgst}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Items Ordered */}
          {items.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Items Ordered ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{item.name ?? "—"}</div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        {item.brand && <span>{item.brand}</span>}
                        {item.category && <span>{item.category}</span>}
                        {item.consumeType && (
                          <Badge className={`text-[10px] px-1.5 py-0 ${item.consumeType === 'Veg' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {item.consumeType}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {"\u20B9"}{parseFloat(item.totAmt ?? item.price ?? 0).toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.qty ?? 1} x {"\u20B9"}{parseFloat(item.price ?? item.menu_price ?? 0).toLocaleString("en-IN")}
                      </div>
                      {item.discount > 0 && (
                        <div className="text-xs text-amber-600">-{"\u20B9"}{item.discount}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Risk Assessment */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Risk Assessment</h3>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm text-gray-500">Risk Level</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClasses(transaction.risk_level)}`}>
                {transaction.risk_level}
              </span>
            </div>

            {transaction.fraud_category && (
              <div className="mb-3 text-sm">
                <span className="text-gray-500">Category: </span>
                <span className="font-medium text-gray-900">{transaction.fraud_category}</span>
              </div>
            )}

            {transaction.triggered_rules && transaction.triggered_rules.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Triggered Rules</span>
                <ul className="mt-1.5 space-y-1">
                  {transaction.triggered_rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
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

          {/* No bill data notice */}
          {!billData && (
            <div className="text-center py-4 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
              Detailed bill data not available for this transaction
            </div>
          )}

          {/* Watch Footage */}
          <Button
            variant="outline"
            disabled
            className="w-full gap-2 border-gray-200 text-gray-400 cursor-not-allowed"
          >
            <Video className="h-4 w-4" />
            Watch Footage (coming soon)
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
