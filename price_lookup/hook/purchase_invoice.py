import frappe
from frappe.utils import flt, cint

@frappe.whitelist()
def get_price_history(item_code=None, history_based_on=None, party=None):
    record_limit = cint(
        frappe.db.get_single_value(
            'Price Lookup Settings',
            'purchase_invoice_historical_data_limit'
        )
    ) or 3

    conditions = " and pi_item.item_code = '{0}'".format(item_code)

    if history_based_on == "Selected Party":
        conditions += " and pi.supplier = '{0}'".format(party)

    pi_item_details = frappe.db.sql("""
        select 
            pi.name as pi_id,
            pi.supplier as supplier,
            pi.posting_date as date,
            pi_item.item_code as item_code,
            pi_item.item_name as item_name,
            pi_item.price_list_rate as mrp,
            pi_item.discount_amount as discount_amount,
            pi_item.discount_percentage as discount_percent,
            pi_item.rate as rate
        from
            `tabPurchase Invoice` pi,
            `tabPurchase Invoice Item` pi_item
        where
            pi.name = pi_item.parent
            and pi.docstatus = 1 {0}
        order by
            pi.name desc
        limit {1};
    """.format(conditions, record_limit), as_dict=True)

    return pi_item_details
