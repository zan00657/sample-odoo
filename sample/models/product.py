from odoo import models, api


class ProductTemplateInherited(models.Model):
    _inherit = "product.template"

    @api.multi
    def website_publish_button(self):
        """
        Overridden to directly publish the product to the website from the form view.
        :return True:
        """
        self.ensure_one()
        self.write({'website_published': not self.website_published})
        return True
