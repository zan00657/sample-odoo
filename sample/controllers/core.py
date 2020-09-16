from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale
from odoo.addons.website.controllers.main import QueryURL


class WebsiteSaleInherited(WebsiteSale):

    @http.route(['/shop/product/<model("product.template"):product>'], type='http', auth="public", website=True)
    def product(self, product, category='', search='', **kwargs):
        """
        This method will open the product. Prepares the product values, variants and other data for the template.
        :param product:
        :param category:
        :param search:
        :param kwargs:
        :return a Dictionary containing all the data for the template:
        """
        product_context = dict(request.env.context,
                               active_id=product.id,
                               partner=request.env.user.partner_id)
        product_category = request.env['product.public.category']

        if category:
            category = product_category.browse(int(category)).exists()

        attrib_list = request.httprequest.args.getlist('attrib')
        attrib_values = [[int(x) for x in v.split("-")] for v in attrib_list if v]
        attrib_set = {v[1] for v in attrib_values}

        keep = QueryURL('/shop', category=category and category.id, search=search, attrib=attrib_list)

        categs = product_category.search([('parent_id', '=', False)])

        price_list = request.website.get_current_pricelist()

        from_currency = request.env.user.company_id.currency_id
        to_currency = price_list.currency_id
        compute_currency = lambda price: from_currency.compute(price, to_currency)

        if not product_context.get('pricelist'):
            product_context['pricelist'] = price_list.id
            product = product.with_context(product_context)
        values = {
            'search': search,
            'category': category,
            'pricelist': price_list,
            'attrib_values': attrib_values,
            'compute_currency': compute_currency,
            'attrib_set': attrib_set,
            'keep': keep,
            'categories': categs,
            'main_object': product,
            'product': product,
            'get_attribute_value_ids': self.get_attribute_value_ids,
            'title': product.name
        }
        return request.render("sample.product", values)
