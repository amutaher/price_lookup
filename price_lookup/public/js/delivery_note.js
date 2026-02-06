frappe.ui.form.on("Delivery Note Item", {
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
        method: 'price_lookup.hook.delivery_note.get_price_history',
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
                let delivery_data = r.message;
                let prepared_data = `<table class="table table-bordered">
                <thead>
                    <tr>
                        <th>DN ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Item</th>
                        <th style="text-align: right;">PLR</th>
                        <th style="text-align: right;">Discount</th>
                        <th style="text-align: right;">Rate</th>
                    </tr>
                </thead>
                <tbody>`
                $.each(delivery_data, function (i) {
                    let discountClass = delivery_data[i].discount_amount > 0 ? 'text-danger' : 'text';
                    prepared_data = prepared_data + `<tr>
                        <td>${delivery_data[i].dn_id}</td>
                        <td>${delivery_data[i].customer}</td>
                        <td>${frappe.datetime.str_to_user(delivery_data[i].date)}</td>
                        <td>${delivery_data[i].item_code}<br>${delivery_data[i].item_name}</td>
                        <td style="text-align: right;">${format_currency(delivery_data[i].mrp)}</td>
                        <td style="text-align: right;" class="${discountClass}">${format_currency(delivery_data[i].discount_amount)}<br>(${frappe.format(delivery_data[i].discount_percent, 'Percent')} %)</td>
                        <td style="text-align: right;">${format_currency(delivery_data[i].rate)}</td>
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