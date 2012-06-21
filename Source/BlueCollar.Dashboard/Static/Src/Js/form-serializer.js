﻿/**
 * Provides form serialization services.
 *
 * @constructor
 * @param {Object} options Initialization options.
 */
var FormSerializer = function(options) {
    this.options = _.extend({}, options);
    this.initialize(options);
};

/**
 * Static {FormSerializer} functions.
 */
_.extend(FormSerializer, {
    /**
     * Inheritence behavior mixin.
     */
    extend: extend,

    /**
     * Gets a selector string that can be used to select inputs
     * for the given attribute name.
     *
     * @param {String} name The attribute name to create the selectors for.
     * @return {String} A string of input selectors.
     */
    inputSelectors: function(name) {
        return 'input[name="' + name + '"], select[name="' + name + '"], textarea[name="' + name + '"]';
    },

    /**
     * Gets a value indicating whether the given element is a jQuery instance.
     *
     * @param {Object} el The element to check.
     * @return {boolean} True if the element is a jQuery instance, false otherwise.
     */
    isJQuery: function(el) {
        return !_.isUndefined(el) && el instanceof jQuery && el.length > 0;
    }
});

/**
 * Prototype {FormSerializer} functions.
 */
_.extend(FormSerializer.prototype, {
    /**
     * Initialization.
     *
     * @param {Object} options Initialization options.
     */
    initialize: function(options) {},

    /**
     * De-serializes the given attributes into the given form element.
     *
     * @param {jQuery} el The jQuery object containing the form element to de-serialize into.
     * @param {Object} attributes The attributes representing the data to de-serialize.
     * @param {Object} serializers An optional hash of {FieldSerializer}s, keyed the same as the attributes object, to use when de-serializing specific fields.
     */
    deserialize: function(el, attributes, serializers) {
        var prop,
            fields,
            ser;

        attributes = attributes || {};
        serializers = serializers || {};

        if (FormSerializer.isJQuery(el)) {
            for (prop in attributes) {
                if (attributes.hasOwnProperty(prop)) {
                    fields = el.find(FormSerializer.inputSelectors(prop));
                    ser = serializers[prop] || new FieldSerializer();
                    ser.deserialize(attributes[prop], fields);
                }
            }
        }
    },

    /**
     * Serializes the given form element.
     *
     * @param {jQuery} el The jQuery object containing the form element to serialize.
     * @param {Object} attributes The attributes hash identifying the names of the fields to serialize.
     * @param {Object} serializers An optional hash of {FieldSerializer}s, keyed the same as the attributes object, to use when serializing specific fields.
     * @return {Object} The serialized form data.
     */
    serialize: function(el, attributes, serializers) {
        var prop,
            fields,
            ser,
            result = {};

        attributes = attributes || {};
        serializers = serializers || {};

        if (FormSerializer.isJQuery(el)) {
            for (prop in attributes) {
                if (attributes.hasOwnProperty(prop)) {
                    fields = el.find(FormSerializer.inputSelectors(prop));
                    ser = serializers[prop] || new FieldSerializer();
                    result[prop] = ser.serialize(fields);
                }
            }
        }

        return result;
    }
});

/**
 * Provides field serialization services.
 *
 * @constructor
 * @param {Object} options Initialization options.
 */
var FieldSerializer = function(options) {
    this.options = _.extend({}, options);
    this.initialize(this.options);
};

/**
 * Static {FieldSerializer} functions.
 */
_.extend(FieldSerializer, {
    /**
     * Inheritence behavior mixin.
     */
    extend: extend
});

/**
 * Prototype {FieldSerializer} functions.
 */
_.extend(FieldSerializer.prototype, {
    /**
     * Initialization.
     *
     * @param {Object} options Initialization options.
     */
    initialize: function(options) {},

    /**
     * De-serializes the given value into the given field element.
     *
     * @param {Object} value The value to de-serialize.
     * @param {jQuery} el The jQuery object containing the field element to de-serialize into.
     */
    deserialize: function(value, el) {
        var tagName,
            type,
            op,
            i,
            n;

        if (FormSerializer.isJQuery(el)) {
            tagName = (el[0].tagName || '').toUpperCase();
            type = (el.attr('type') || '').toUpperCase();

            if (tagName === 'INPUT' && type === 'CHECKBOX') {
                if (!_.isUndefined(value) && !_.isNull(value) && !_.isNaN(value)) {
                    if (!_.isArray(value)) {
                        value = [value.toString()];
                    }
                }

                value = (value || []).map(function(v) { return v.toString(); });

                for (i = 0, n = el.length; i < n; i++) {
                    el[i].checked = '';

                    if (_.any(value, function(v) { return v === $(el[i]).val(); })) {
                        el[i].checked = 'checked';
                    }
                }
            } else if (tagName === 'INPUT' && type === 'RADIO') {
                if (!_.isUndefined(value) && !_.isNull(value) && !_.isNaN(value)) {
                    value = value.toString();
                } else {
                    value = null;
                }

                for (i = 0, n = el.length; i < n; i++) {
                    el[i].checked = value === $(el[i]).val() ? 'checked' : '';
                }
            } else if (tagName === 'SELECT') {
                if (el[0].options.length > 0) {
                    if (!_.isUndefined(value) && !_.isNull(value) && !_.isNaN(value)) {
                        value = value.toString();
                        
                        for (i = el[0].options.length - 1; i >= 0; i--) {
                            op = el[0].options.item(i);
                            
                            if ((op.value && value === op.value) || value === op.text || i === 0) {
                                el[0].selectedIndex = i;
                                break;
                            }
                        }
                    } else {
                        el[0].selectedIndex = 0;
                    }
                }
            } else {
                if (!_.isUndefined(value) && !_.isNull(value) && !_.isNaN(value)) {
                    el.val(value.toString());
                } else {
                    el.val('');
                }
            } 
        }
    },

    /**
     * Serializes the given field element into a primitive value.
     *
     * @param {jQuery} el A jQuery object containing a field element to serialize.
     * @return {Object} The serialized primitive value.
     */
    serialize: function(el) {
        var tagName,
            type,
            i,
            n,
            val = null;

        if (FormSerializer.isJQuery(el)) {
            tagName = (el[0].tagName || '').toUpperCase();
            type = (el.attr('type') || '').toUpperCase();

            if (tagName === 'INPUT' && type === 'CHECKBOX') {
                val = [];

                for (i = 0, n = el.length; i < n; i++) {
                    if (el[i].checked) {
                        val.push($(el[i]).val());
                    }
                }
            } else if (tagName === 'INPUT' && type === 'RADIO') {
                for (i = 0, n = el.length; i < n; i++) {
                    if (el[i].checked) {
                        val = $(el[i]).val();
                        break;
                    }
                }
            } else {
                val = el.val();
            }
        }

        return val;
    }
});