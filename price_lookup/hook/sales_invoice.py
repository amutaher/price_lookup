import frappe
from frappe.utils import flt, cint

@frappe.whitelist()
def get_price_history(item_code = None, history_based_on = None, party = None):
    record_limit = cint(frappe.db.get_single_value('Price Lookup Settings', 'sales_invoice_historical_data_limit')) or 3

    conditions = " and si_item.item_code = '{0}'".format(item_code)

    if history_based_on == "Selected Party":
        conditions += " and si.customer = '{0}'".format(party)

    quote_item_details = frappe.db.sql("""
        select 
            si.name as si_id, 
            si.customer as customer, 
            si.posting_date as date, 
            si_item.item_code as item_code, 
            si_item.item_name as item_name, 
            si_item.price_list_rate as mrp, 
            si_item.discount_amount as discount_amount,
            si_item.discount_percentage as discount_percent,
            si_item.rate as rate 
        from 
            `tabSales Invoice` si, `tabSales Invoice Item` si_item 
        where 
            si.name = si_item.parent and si.docstatus = 1 {0}
        order by 
            si.name desc
        limit {1};""".format(conditions, record_limit), as_dict = True)

    return quote_item_details