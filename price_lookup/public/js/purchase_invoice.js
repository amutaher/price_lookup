frappe.ui.form.on("Purchase Invoice Item", {
    item_code(frm, cdt, cdn) {
        let child_row = locals[cdt][cdn];
        if (child_row.item_code) {
            set_price_history(frm, child_row);
        }
    },
    history_based_on(frm, cdt, cdn) {
        let child_row = locals[cdt][cdn];
        if (child_row.item_code) {
            set_price_history(frm, child_row);
        }
    },
    sync_updated_data(frm, cdt, cdn) {
        let child_row = locals[cdt][cdn];
        if (child_row.item_code) {
            set_price_history(frm, child_row);
        }
    }
});

function set_price_history(frm, child_row) {
    frappe.call({
        method: 'price_lookup.hook.purchase_invoice.get_price_history',
        args: {
            item_code: child_row.item_code,
            history_based_on: child_row.history_based_on,
            party: frm.doc.supplier
        },
        callback: function (r) {
            if (r.message.length == 0) {
                frappe.model.set_value(child_row.doctype, child_row.name,
                    'price_details', `<div style="text-align: center; font-weight: bold; color: red;">
                        No historical data found
                    </div>`
                )
            }
            else {
                let invoice_data = r.message;
                let prepared_data = `<table class="table table-bordered">
                <thead>
                    <tr>
                        <th>PI ID</th>
                        <th>Party</th>
                        <th>Date</th>
                        <th>Item</th>
                        <th style="text-align: right;">MRP</th>
                        <th style="text-align: right;">Discount</th>
                        <th style="text-align: right;">Rate</th>
                    </tr>
                </thead>
                <tbody>`
                $.each(invoice_data, function (i) {
                    let discountClass = invoice_data[i].discount_amount > 0 ? 'text-danger' : 'text';
                    prepared_data = prepared_data + `<tr>
                        <td>${invoice_data[i].pr_id}</td>
                        <td>${invoice_data[i].supplier}</td>
                        <td>${frappe.datetime.str_to_user(invoice_data[i].date)}</td>
                        <td>${invoice_data[i].item_code}<br>${invoice_data[i].item_name}</td>
                        <td style="text-align: right;">${format_currency(invoice_data[i].mrp)}</td>
                        <td style="text-align: right;" class="${discountClass}">${format_currency(invoice_data[i].discount_amount)}<br>(${frappe.format(invoice_data[i].discount_percent, 'Percent')} %)</td>
                        <td style="text-align: right;">${format_currency(invoice_data[i].rate)}</td>
                    </tr>`
                })
                prepared_data = prepared_data + `</tbody></table>`;
                frappe.model.set_value(child_row.doctype, child_row.name,
                    'price_details', prepared_data
                )
            }
        }
    });
}