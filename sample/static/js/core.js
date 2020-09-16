/**
 * This function will convert a price to a price string separated by commas.
 * @param {Number} n Price,
 * @return {String} Comma separated Price string.
*/
function numberWithCommas(n) {
    if (n < 1000) {
        return n + '';
    } else {
        n += '';
        if (n.indexOf('e') !== -1) {
          return n;
        }
        let i = n.indexOf('.');
        let f = i == -1 ? '' : n.slice(i);
        if (f) n = n.slice(0, i)
        i = n.length;
        n = n.split('');
        while (i > 3) n.splice((i -= 3), 0, ',');
        return n.join('') + f;
    }
}

/**
 * This function will format Numbers.
 * @param {price} num Number,
 * @return {String} Formatted Number .
*/
function formatNumberOnDecimal(num) {
    if (num % 1 == 0)
        return parseInt(num);
    else
        return parseFloat(num.toFixed(2));
}

/**
 * General function that formats the number and convert to comma separated string.
 * @param {price} n Number,
 * @return {String} Comma Separated String .
*/
function convertNoWithComma(x) {
    let formattedNo = formatNumberOnDecimal(x);
    return numberWithCommas(formattedNo);
}

$(function () {

    /**
     * Function that updates the product variant image on Attribute Value Change.
     * @param {event_source} Source name (Selector),
     * @param {product_id} (Product id),
    */
    function update_product_image(event_source, product_id) {
        var $img;
        if ($('#o-carousel-product').length) {
            $img = $(event_source).closest('tr.js_product, .oe_website_sale').find('img.js_variant_img');
            $img.attr("src", "/web/image/product.product/" + product_id + "/image");
            $img.parent().attr('data-oe-model', 'product.product').attr('data-oe-id', product_id)
                .data('oe-model', 'product.product').data('oe-id', product_id);

            var $thumbnail = $(event_source).closest('tr.js_product, .oe_website_sale').find('img.js_variant_img_small');
            if ($thumbnail.length !== 0) { // if only one, thumbnails are not displayed
                $thumbnail.attr("src", "/web/image/product.product/" + product_id + "/image/90x90");
                $('.carousel').carousel(0);
            }
        }
        else {
            $img = $(event_source).closest('tr.js_product, .oe_website_sale').find('span[data-oe-model^="product."][data-oe-type="image"] img:first, img.product_detail_img');
            $img.attr("src", "/web/image/product.product/" + product_id + "/image");
            $img.parent().attr('data-oe-model', 'product.product').attr('data-oe-id', product_id)
                .data('oe-model', 'product.product').data('oe-id', product_id);
        }
    }

    /**
     * Function that triggers the onchange of the Attribute Values and trigger the image, price and validates if that combination is possible.
    */
    $(".js_product").on('change', 'input.js_variant_change, select.js_variant_change, ul[data-attribute_value_ids]', function (ev) {
        var $ul = $(ev.target).closest('.js_add_cart_variants');
        var $parent = $ul.closest('.js_product');
        var $product_id = $parent.find('.product_id').first();
        var $price = $parent.find(".oe_price:first .oe_currency_value");
        var $default_price = $parent.find(".oe_default_price:first .oe_currency_value");
        var $optional_price = $parent.find(".oe_optional:first .oe_currency_value");
        var variant_ids = $ul.data("attribute_value_ids");
        if(_.isString(variant_ids)) {
            variant_ids = JSON.parse(variant_ids.replace(/'/g, '"'));
        }
        var values = [];
        var unchanged_values = $parent.find('div.oe_unchanged_value_ids').data('unchanged_value_ids') || [];
        $parent.find('input.js_variant_change:checked, select.js_variant_change').each(function () {
            values.push(+$(this).val());
        });
        values =  values.concat(unchanged_values);
        $parent.find("label").removeClass("text-muted css_not_available");
        var product_id = false;
        for (var k in variant_ids) {
            if (_.isEmpty(_.difference(variant_ids[k][1], values))) {
                $price.html(convertNoWithComma(variant_ids[k][2]));
                $default_price.html(convertNoWithComma(variant_ids[k][3]));
                if (variant_ids[k][3]-variant_ids[k][2]>0.01) {
                    $default_price.closest('.oe_website_sale').addClass("discount");
                    $optional_price.closest('.oe_optional').show().css('text-decoration', 'line-through');
                    $default_price.parent().removeClass('hidden');
                } else {
                    $optional_price.closest('.oe_optional').hide();
                    $default_price.parent().addClass('hidden');
                }
                product_id = variant_ids[k][0];
                update_product_image(this, product_id);
                break;
            }
        }

        $parent.find("input.js_variant_change:radio, select.js_variant_change").each(function () {
            var $input = $(this);
            var id = +$input.val();
            var values = [id];

            $parent.find("ul:not(:has(input.js_variant_change[value='" + id + "'])) input.js_variant_change:checked, select.js_variant_change").each(function () {
                values.push(+$(this).val());
            });

            for (var k in variant_ids) {
                if (!_.difference(values, variant_ids[k][1]).length) {
                    return;
                }
            }
            $input.closest("label").addClass("css_not_available");
            $input.find("option[value='" + id + "']").addClass("css_not_available");
        });
        if (product_id) {
            $parent.removeClass("css_not_available");
            $product_id.val(product_id);
            $parent.find("#add_to_cart").removeClass("disabled");
            $(".combination_error").hide();
        } else {
            $parent.addClass("css_not_available");
            $product_id.val(0);
            $parent.find("#add_to_cart").addClass("disabled");
            $(".combination_error").show();
        }
    });

    $('div.js_product').each(function () {
        $('input.js_product_change', this).first().prop('checked', 'checked').trigger('change');
    });

    $('.js_add_cart_variants').each(function () {
        $('input.js_variant_change, select.js_variant_change', this).first().trigger('change');
    });

});