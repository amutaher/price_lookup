import frappe
from frappe.utils import flt, cint

@frappe.whitelist()
def get_price_history(item_code = None, history_based_on = None, party = None):
    record_limit = cint(frappe.db.get_single_value('Price Lookup Settings', 'purchase_receipt_historical_data_limit')) or 3

    conditions = " and pr_item.item_code = '{0}'".format(item_code)

    if history_based_on == "Selected Party":
        conditions += " and pr.supplier = '{0}'".format(party)

    pr_item_details = frappe.db.sql("""
        select 
            pr.name as pr_id, 
            pr.supplier as supplier, 
            pr.posting_date as date, 
            pr_item.item_code as item_code, 
            pr_item.item_name as item_name, 
            pr_item.price_list_rate as mrp, 
            pr_item.discount_amount as discount_amount,
            pr_item.discount_percentage as discount_percent,
            pr_item.rate as rate 
        from 
            `tabPurchase Receipt` pr, `tabPurchase Receipt Item` pr_item 
        where 
            pr.name = pr_item.parent and pr.docstatus = 1 {0}
        order by 
            pr.name desc
        limit {1};""".format(conditions, record_limit), as_dict = True)

    return pr_item_details