import frappe
from frappe.utils import cint

@frappe.whitelist()
def get_price_history(item_code=None, history_based_on=None, party=None):
    record_limit = cint(
        frappe.db.get_single_value(
            'Price Lookup Settings',
            'delivery_note_historical_data_limit'
        )
    ) or 3

    conditions = " and dn_item.item_code = '{0}'".format(item_code)

    if history_based_on == "Selected Party":
        conditions += " and dn.customer = '{0}'".format(party)

    dn_item_details = frappe.db.sql("""
        select 
            dn.name as dn_id,
            dn.customer as customer,
            dn.posting_date as date,
            dn_item.item_code as item_code,
            dn_item.item_name as item_name,
            dn_item.price_list_rate as mrp,
            dn_item.discount_amount as discount_amount,
            dn_item.discount_percentage as discount_percent,
            dn_item.rate as rate
        from
            `tabDelivery Note` dn,
            `tabDelivery Note Item` dn_item
        where
            dn.name = dn_item.parent
            and dn.docstatus = 1
            and dn.is_return = 0 {0}
        order by
            dn.name desc
        limit {1};
    """.format(conditions, record_limit), as_dict=True)

    return dn_item_details
