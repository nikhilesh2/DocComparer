/**
*  Ajax Autocomplete for jQuery, version %version%
*  (c) 2017 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: https://github.com/devbridge/jQuery-Autocomplete
*/

/*jslint  browser: true, white: true, single: true, this: true, multivar: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var
        utils = (function () {
            return {
                escapeRegExChars: function (value) {
                    return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
                },
                createNode: function (containerClass) {
                    var div = document.createElement('div');
                    div.className = containerClass;
                    div.style.position = 'absolute';
                    div.style.display = 'none';
                    return div;
                }
            };
        }()),

        keys = {
            ESC: 27,
            TAB: 9,
            RETURN: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        },

        noop = $.noop;

    function Autocomplete(el, options) {
        var that = this;

        // Shared variables:
        that.element = el;
        that.el = $(el);
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.timeoutId = null;
        that.cachedResponse = {};
        that.onChangeTimeout = null;
        that.onChange = null;
        that.isLocal = false;
        that.suggestionsContainer = null;
        that.noSuggestionsContainer = null;
        that.options = $.extend({}, Autocomplete.defaults, options);
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: 'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    Autocomplete.utils = utils;

    $.Autocomplete = Autocomplete;

    Autocomplete.defaults = {
            ajaxSettings: {},
            autoSelectFirst: false,
            appendTo: 'body',
            serviceUrl: null,
            lookup: null,
            onSelect: null,
            width: 'auto',
            minChars: 1,
            maxHeight: 300,
            deferRequestBy: 0,
            params: {},
            formatResult: _formatResult,
            formatGroup: _formatGroup,
            delimiter: null,
            zIndex: 9999,
            type: 'GET',
            noCache: false,
            onSearchStart: noop,
            onSearchComplete: noop,
            onSearchError: noop,
            preserveInput: false,
            containerClass: 'autocomplete-suggestions',
            tabDisabled: false,
            dataType: 'text',
            currentRequest: null,
            triggerSelectOnValidInput: true,
            preventBadQueries: true,
            lookupFilter: _lookupFilter,
            paramName: 'query',
            transformResult: _transformResult,
            showNoSuggestionNotice: false,
            noSuggestionNotice: 'No results',
            orientation: 'bottom',
            forceFixPosition: false
    };

    function _lookupFilter(suggestion, originalQuery, queryLowerCase) {
        return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
    };

    function _transformResult(response) {
        return typeof response === 'string' ? $.parseJSON(response) : response;
    };

    function _formatResult(suggestion, currentValue) {
        // Do not replace anything if the current value is empty
        if (!currentValue) {
            return suggestion.value;
        }

        var pattern = '(' + utils.escapeRegExChars(currentValue) + ')';

        return suggestion.value
            .replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
    };

    function _formatGroup(suggestion, category) {
        return '<div class="autocomplete-group">' + category + '</div>';
    };

    Autocomplete.prototype = {

        initialize: function () {
            var that = this,
                suggestionSelector = '.' + that.classes.suggestion,
                selected = that.classes.selected,
                options = that.options,
                container;

            // Remove autocomplete attribute to prevent native suggestions:
            that.element.setAttribute('autocomplete', 'off');

            // html() deals with many types: htmlString or Element or Array or jQuery
            that.noSuggestionsContainer = $('<div class="autocomplete-no-suggestion"></div>')
                                          .html(this.options.noSuggestionNotice).get(0);

            that.suggestionsContainer = Autocomplete.utils.createNode(options.containerClass);

            container = $(that.suggestionsContainer);

            container.appendTo(options.appendTo || 'body');

            // Only set width if it was provided:
            if (options.width !== 'auto') {
                container.css('width', options.width);
            }

            // Listen for mouse over event on suggestions list:
            container.on('mouseover.autocomplete', suggestionSelector, function () {
                that.activate($(this).data('index'));
            });

            // Deselect active element when mouse leaves suggestions container:
            container.on('mouseout.autocomplete', function () {
                that.selectedIndex = -1;
                container.children('.' + selected).removeClass(selected);
            });

            // Listen for click event on suggestions list:
            container.on('click.autocomplete', suggestionSelector, function () {
                that.select($(this).data('index'));
            });

            container.on('click.autocomplete', function () {
                clearTimeout(that.blurTimeoutId);
            })

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            $(window).on('resize.autocomplete', that.fixPositionCapture);

            that.el.on('keydown.autocomplete', function (e) { that.onKeyPress(e); });
            that.el.on('keyup.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('blur.autocomplete', function () { that.onBlur(); });
            that.el.on('focus.autocomplete', function () { that.onFocus(); });
            that.el.on('change.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('input.autocomplete', function (e) { that.onKeyUp(e); });
        },

        onFocus: function () {
            var that = this;

            that.fixPosition();

            if (that.el.val().length >= that.options.minChars) {
                that.onValueChange();
            }
        },

        onBlur: function () {
            var that = this;

            // If user clicked on a suggestion, hide() will
            // be canceled, otherwise close suggestions
            that.blurTimeoutId = setTimeout(function () {
                that.hide();
            }, 200);
        },

        abortAjax: function () {
            var that = this;
            if (that.currentRequest) {
                that.currentRequest.abort();
                that.currentRequest = null;
            }
        },

        setOptions: function (suppliedOptions) {
            var that = this,
                options = $.extend({}, that.options, suppliedOptions);
            that.isLocal = Array.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            options.orientation = that.validateOrientation(options.orientation, 'bottom');

            // Adjust height, width and z-index:
            $(that.suggestionsContainer).css({
                'max-height': options.maxHeight + 'px',
                'width': options.width + 'px',
                'z-index': options.zIndex
            });

            this.options = options;            
        },


        clearCache: function () {
            this.cachedResponse = {};
            this.badQueries = [];
        },

        clear: function () {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
        },

        disable: function () {
            var that = this;
            that.disabled = true;
            clearTimeout(that.onChangeTimeout);
            that.abortAjax();
        },

        enable: function () {
            this.disabled = false;
        },

        fixPosition: function () {
            // Use only when container has already its content

            var that = this,
                $container = $(that.suggestionsContainer),
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !that.options.forceFixPosition) {
                return;
            }

            // Choose orientation
            var orientation = that.options.orientation,
                containerHeight = $container.outerHeight(),
                height = that.el.outerHeight(),
                offset = that.el.offset(),
                styles = { 'top': offset.top, 'left': offset.left };

            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = (Math.max(topOverflow, bottomOverflow) === topOverflow) ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if(containerParent !== document.body) {
                var opacity = $container.css('opacity'),
                    parentOffsetDiff;

                    if (!that.visible){
                        $container.css('opacity', 0).show();
                    }

                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.top += containerParent.scrollTop;
                styles.left -= parentOffsetDiff.left;

                if (!that.visible){
                    $container.css('opacity', opacity).hide();
                }
            }

            if (that.options.width === 'auto') {
                styles.width = that.el.outerWidth() + 'px';
            }

            $container.css(styles);
        },

        isCursorAtEnd: function () {
            var that = this,
                valLength = that.el.val().length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyPress: function (e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    that.el.val(that.currentValue);
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
                    if (that.hint && that.options.onHint) {
                        that.selectHint();
                        return;
                    }
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function (e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearTimeout(that.onChangeTimeout);

            if (that.currentValue !== that.el.val()) {
                that.findBestHint();
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeTimeout = setTimeout(function () {
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                } else {
                    that.onValueChange();
                }
            }
        },

        onValueChange: function () {

            if (this.ignoreValueChange) {
                this.ignoreValueChange = false;
                return;
            }

            var that = this,
                options = that.options,
                value = that.el.val(),
                query = that.getQuery(value);

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || $.noop).call(that.element);
            }

            clearTimeout(that.onChangeTimeout);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput && that.isExactMatch(query)) {
                that.select(0);
                return;
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        isExactMatch: function (query) {
            var suggestions = this.suggestions;

            return (suggestions.length === 1 && suggestions[0].value.toLowerCase() === query.toLowerCase());
        },

        getQuery: function (value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);
            return $.trim(parts[parts.length - 1]);
        },

        getSuggestionsLocal: function (query) {

            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;
            data = {
                suggestions: $.grep(options.lookup, function (suggestion) {
                    return filter(suggestion, query, queryLowerCase);
                })
            };
            console.log("Data is "  + JSON.stringify(data));
            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function (q) {


            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;
            var name = q.split(' ');
    
            var fName = name[0];
            var lName = name[1] != null ? name[1] : '';
    
            if(fName.length >= 2) {
                fName += '*';
                lName = lName.length >= 2 ? lName + '*' : ''; 
            }

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            params = options.ignoreParams ? null : options.params;

            if ($.isFunction(options.lookup)) {
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if ($.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                  
                }

                cacheKey = serviceUrl+ '?' + fName + lName;
                
                response = that.cachedResponse[cacheKey];
            }

            if (response && Array.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                that.abortAjax();

                ajaxSettings = {
                    url: serviceUrl,
                    data: {"fName": fName, "lName": lName},
                    // type: //options.type,
                    dataType: 'json'//options.dataType
                };

                $.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = $.ajax(ajaxSettings).done(function (data) {

                    // var data = {"result_count":10, "results":[{"taxonomies": [{"state": "AZ", "code": "207VG0400X", "primary": true, "license": "MD16756", "desc": "Obstetrics & Gynecology Gynecology"}], "addresses": [{"city": "MESA", "address_2": "STE 115", "telephone_number": "480-610-5300", "fax_number": "480-610-5340", "state": "AZ", "postal_code": "852064617", "address_1": "4540 E BASELINE RD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "MESA", "address_2": "STE 115", "telephone_number": "480-610-5300", "fax_number": "480-610-5340", "state": "AZ", "postal_code": "852064617", "address_1": "4540 E BASELINE RD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1117497600, "identifiers": [], "other_names": [], "number": 1225031503, "last_updated_epoch": 1183852800, "basic": {"status": "A", "credential": "MD", "first_name": "JO", "last_name": "KNATZ", "middle_name": "MERRIWETHER", "name": "KNATZ JO", "sole_proprietor": "NO", "gender": "F", "last_updated": "2007-07-08", "name_prefix": "DR.", "enumeration_date": "2005-05-31"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "NE", "code": "208000000X", "primary": true, "license": "17461", "desc": "Pediatrics"}], "addresses": [{"city": "LINCOLN", "address_2": "SUITE 110", "telephone_number": "402-489-0800", "fax_number": "402-489-6803", "state": "NE", "postal_code": "685104201", "address_1": "7001 A ST", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "LINCOLN", "address_2": "SUITE 110", "telephone_number": "402-489-0800", "fax_number": "402-489-6803", "state": "NE", "postal_code": "685104201", "address_1": "7001 A ST", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1118188800, "identifiers": [], "other_names": [], "number": 1629072681, "last_updated_epoch": 1204502400, "basic": {"status": "A", "credential": "M.D.", "first_name": "JO", "last_name": "KINBERG", "middle_name": "A.", "name": "KINBERG JO", "gender": "F", "sole_proprietor": "NO", "last_updated": "2008-03-03", "enumeration_date": "2005-06-08"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "", "code": "174400000X", "primary": true, "license": "", "desc": "Specialist"}], "addresses": [{"city": "SAN BERNARDINO", "address_2": "SUITE J", "telephone_number": "909-882-0193", "fax_number": "909-883-4834", "state": "CA", "postal_code": "924044851", "address_1": "355 E 21ST ST", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "SAN BERNARDINO", "address_2": "SUITE J", "telephone_number": "909-882-0193", "fax_number": "909-883-4834", "state": "CA", "postal_code": "924044851", "address_1": "355 E 21ST ST", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1120694400, "identifiers": [], "other_names": [], "number": 1376541037, "last_updated_epoch": 1183852800, "basic": {"status": "A", "first_name": "JO", "last_name": "FLANAGAN", "middle_name": "EVELYN", "name": "FLANAGAN JO", "sole_proprietor": "NO", "gender": "F", "last_updated": "2007-07-08", "name_prefix": "MRS.", "enumeration_date": "2005-07-07"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "MN", "code": "103T00000X", "primary": true, "license": "LP2119", "desc": "Psychologist"}], "addresses": [{"city": "WHITE BEAR LAKE", "address_2": "SUITE 104C", "telephone_number": "612-203-8654", "fax_number": "651-762-3780", "state": "MN", "postal_code": "551103624", "address_1": "1310 HIGHWAY 96 E", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "WHITE BEAR LAKE", "address_2": "SUITE 104C", "telephone_number": "612-203-8654", "fax_number": "651-762-3780", "state": "MN", "postal_code": "551103624", "address_1": "1310 HIGHWAY 96 E", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1121126400, "identifiers": [{"code": "01", "issuer": "UCARE ID", "state": "MN", "identifier": "101771", "desc": "Other"}, {"code": "01", "issuer": "HEALTHPARTNERS ID", "state": "MN", "identifier": "HP26603", "desc": "Other"}, {"code": "01", "issuer": "CIGNA BEHAVIORAL ID", "state": "MN", "identifier": "1101299", "desc": "Other"}, {"code": "01", "issuer": "BLUECROSS&BLUESHIELD ID", "state": "MN", "identifier": "41M25HA", "desc": "Other"}, {"code": "01", "issuer": "UNITED BEHAVIORAL ID", "state": "MN", "identifier": "61-71156", "desc": "Other"}, {"code": "01", "issuer": "BEHAVIORAL HEALTHCARE PRO", "state": "MN", "identifier": "20244", "desc": "Other"}], "other_names": [], "number": 1104824234, "last_updated_epoch": 1183852800, "basic": {"status": "A", "credential": "PH.D.", "first_name": "JO", "last_name": "HARKINS-CRAVEN", "middle_name": "ANNE", "name": "HARKINS-CRAVEN JO", "gender": "F", "sole_proprietor": "NO", "last_updated": "2007-07-08", "enumeration_date": "2005-07-12"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "TX", "code": "363LF0000X", "primary": true, "license": "237203", "desc": "Nurse Practitioner Family"}], "addresses": [{"city": "DALLAS", "address_2": "DEPT. OF ANESTHESIOLOGY", "telephone_number": "214-590-8329", "state": "TX", "postal_code": "752357708", "address_1": "5201 HARRY HINES BLVD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "DALLAS", "address_2": "", "telephone_number": "214-590-4105", "fax_number": "214-590-4162", "state": "TX", "postal_code": "752660599", "address_1": "PO BOX 660599", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1121385600, "identifiers": [{"code": "05", "issuer": "", "state": "TX", "identifier": "042545603", "desc": "MEDICAID"}], "other_names": [], "number": 1790784437, "last_updated_epoch": 1267660800, "basic": {"status": "A", "credential": "FNP-BC", "first_name": "JO", "last_name": "HOWARD", "middle_name": "ELLEN", "name": "HOWARD JO", "gender": "F", "sole_proprietor": "NO", "last_updated": "2010-03-04", "enumeration_date": "2005-07-15"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "SC", "code": "2084P0800X", "primary": true, "license": "12465", "desc": "Psychiatry & Neurology Psychiatry"}], "addresses": [{"city": "COLUMBIA", "address_2": "SUITE 204", "telephone_number": "803-254-9767", "fax_number": "803-254-9740", "state": "SC", "postal_code": "292012318", "address_1": "1903 GADSDEN ST", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "COLUMBIA", "address_2": "SUITE 204", "telephone_number": "803-254-9767", "fax_number": "803-254-9740", "state": "SC", "postal_code": "292012318", "address_1": "1903 GADSDEN ST", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1121472000, "identifiers": [], "other_names": [], "number": 1609875244, "last_updated_epoch": 1183852800, "basic": {"status": "A", "credential": "M.D.", "first_name": "JO", "last_name": "MARTURANO", "last_updated": "2007-07-08", "name": "MARTURANO JO", "gender": "F", "sole_proprietor": "NO", "name_prefix": "DR.", "enumeration_date": "2005-07-16"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "MN", "code": "207R00000X", "primary": true, "license": "23954", "desc": "Internal Medicine"}], "addresses": [{"city": "MOUND", "address_2": "", "telephone_number": "952-495-2000", "fax_number": "952-495-2060", "state": "MN", "postal_code": "553641547", "address_1": "2200 COMMERCE BLVD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "MOUND", "address_2": "", "telephone_number": "952-495-2000", "fax_number": "952-495-2060", "state": "MN", "postal_code": "553641547", "address_1": "2200 COMMERCE BLVD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1121817600, "identifiers": [{"code": "01", "issuer": "MEDICAL LICENSE", "state": "MN", "identifier": "23954", "desc": "Other"}], "other_names": [], "number": 1487653473, "last_updated_epoch": 1183852800, "basic": {"status": "A", "credential": "MD", "first_name": "JO", "last_name": "BERGER", "middle_name": "M", "name": "BERGER JO", "gender": "F", "sole_proprietor": "NO", "last_updated": "2007-07-08", "enumeration_date": "2005-07-20"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "WA", "code": "231H00000X", "primary": true, "license": "LD00001007", "desc": "Audiologist"}], "addresses": [{"city": "BELLEVUE", "address_2": "SUITE 400", "telephone_number": "206-987-5770", "fax_number": "206-987-5779", "state": "WA", "postal_code": "980044623", "address_1": "1135 116TH AVE NE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "BELLEVUE", "address_2": "SUITE 400", "telephone_number": "206-987-5770", "fax_number": "206-987-5779", "state": "WA", "postal_code": "980044623", "address_1": "1135 116TH AVE NE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1121904000, "identifiers": [{"code": "01", "issuer": "LABOR AND INDUSTRIES", "state": "WA", "identifier": "0195901", "desc": "Other"}, {"code": "01", "issuer": "REGENCE BS RIDER #", "state": "WA", "identifier": "9713KO", "desc": "Other"}, {"code": "05", "issuer": "", "state": "WA", "identifier": "8329286", "desc": "MEDICAID"}], "other_names": [{"credential": "CCC-A", "first_name": "JO", "last_name": "KOENIG", "middle_name": "ANN", "code": "1", "type": "Former Name"}], "number": 1164422028, "last_updated_epoch": 1237420800, "basic": {"status": "A", "credential": "CCC-A", "first_name": "JO", "last_name": "HALL", "middle_name": "KOENIG", "name": "HALL JO", "gender": "F", "sole_proprietor": "NO", "last_updated": "2009-03-19", "enumeration_date": "2005-07-21"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "OH", "code": "207R00000X", "primary": true, "license": "35054725", "desc": "Internal Medicine"}], "addresses": [{"city": "KETTERING", "address_2": "", "telephone_number": "937-434-4323", "fax_number": "937-434-4541", "state": "OH", "postal_code": "454292206", "address_1": "5678 FAR HILLS AVE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "KETTERING", "address_2": "", "telephone_number": "937-434-4323", "fax_number": "937-434-4541", "state": "OH", "postal_code": "454292206", "address_1": "5678 FAR HILLS AVE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1122940800, "identifiers": [{"code": "01", "issuer": "ANTHEM", "state": "OH", "identifier": "000000015667", "desc": "Other"}, {"code": "05", "issuer": "", "state": "OH", "identifier": "0702663", "desc": "MEDICAID"}], "other_names": [], "number": 1588665582, "last_updated_epoch": 1266883200, "basic": {"status": "A", "credential": "M.D.", "first_name": "JO", "last_name": "PELFREY", "middle_name": "YVETTE", "name": "PELFREY JO", "sole_proprietor": "YES", "gender": "F", "last_updated": "2010-02-23", "name_prefix": "DR.", "enumeration_date": "2005-08-02"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "KY", "code": "367500000X", "primary": true, "license": "1718A", "desc": "Nurse Anesthetist, Certified Registered"}], "addresses": [{"city": "LOUISVILLE", "address_2": "", "telephone_number": "502-259-5391", "fax_number": "502-259-9733", "state": "KY", "postal_code": "402074605", "address_1": "4000 KRESGE WAY", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "LOUISVILLE", "address_2": "", "telephone_number": "502-259-5391", "fax_number": "502-259-9733", "state": "KY", "postal_code": "402324748", "address_1": "PO BOX 34748", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1123545600, "identifiers": [{"code": "05", "issuer": "", "state": "KY", "identifier": "74428913", "desc": "MEDICAID"}, {"code": "05", "issuer": "", "state": "IN", "identifier": "100003500A", "desc": "MEDICAID"}], "other_names": [], "number": 1891796348, "last_updated_epoch": 1353024000, "basic": {"status": "A", "credential": "CRNA", "first_name": "JO", "last_name": "WILBURN", "middle_name": "E", "name": "WILBURN JO", "gender": "F", "sole_proprietor": "NO", "last_updated": "2012-11-16", "enumeration_date": "2005-08-09"}, "enumeration_type": "NPI-1"}]};// JSON.stringify(data2).replace(/\\/g, "");
                    // console.log("Data " + JSONdata);
                    var result;
                    data = that.formatData(data);

                    // var data = [{"label": "jolene", "value": "jolene", "credential": "sdfsdf", "npi":1231231231}, {"label": "nikhilesh", "value": "nikhilesh", "credential": "sdfsdf", "npi":1231231231}];
                    that.currentRequest = null;
                    data = {
                        suggestions: $.grep(data, function (suggestion) {
                            return options.lookupFilter(suggestion, q, q.toLowerCase());
                        })
                    };

                    result = options.transformResult(data, q);

                    that.processResponse(result, q, cacheKey);
                    options.onSearchComplete.call(that.element, q, result.suggestions);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                    options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
                });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },
        formatData: function(data) {
            const modifiedData =  $.map(data.results, function (item) {
             console.log("ITEM IS " + item);
                return {
                    label: item.basic.first_name + " " + item.basic.last_name,
                    value: item.basic.first_name + " " + item.basic.last_name,
                    credential: item.basic.credential,
                    npi: item.number,
                    city: item.addresses[0].city,
                    state: item.addresses[0].state,
                    country_code: item.addresses[0].country_code,
                    // image_url: img,
                };
            });
            return modifiedData;
        },
        isBadQuery: function (q) {
            if (!this.options.preventBadQueries){
                return false;
            }

            var badQueries = this.badQueries,
                i = badQueries.length;

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function () {
            var that = this,
                container = $(that.suggestionsContainer);

            if ($.isFunction(that.options.onHide) && that.visible) {
                that.options.onHide.call(that.element, container);
            }

            that.visible = false;
            that.selectedIndex = -1;
            clearTimeout(that.onChangeTimeout);
            $(that.suggestionsContainer).hide();
            that.signalHint(null);
        },

        suggest: function () {
            if (!this.suggestions.length) {
                if (this.options.showNoSuggestionNotice) {
                    this.noSuggestions();
                } else {
                    this.hide();
                }
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer),
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function (suggestion, index) {
                        var currentCategory = suggestion.data[groupBy];

                        if (category === currentCategory){
                            return '';
                        }

                        category = currentCategory;

                        return options.formatGroup(suggestion, category);
                    };

            if (options.triggerSelectOnValidInput && that.isExactMatch(value)) {
                that.select(0);
                return;
            }

            // Build suggestions inner HTML:
            $.each(that.suggestions, function (i, suggestion) {
                if (groupBy){
                    html += formatGroup(suggestion, value, i);
                }
                console.log(suggestion.country_code);
                html += '<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value, i) + '<span style="float: right; font-size: 12px">' + suggestion.city + ', ' + suggestion.state + '</span>' + '</div>';
            });

            this.adjustContainerWidth();

            noSuggestionsContainer.detach();
            container.html(html);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container, that.suggestions);
            }

            that.fixPosition();
            container.show();

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop(0);
                container.children('.' + className).first().addClass(classSelected);
            }

            that.visible = true;
            that.findBestHint();
        },

        noSuggestions: function() {
             var that = this,
                 beforeRender = that.options.beforeRender,
                 container = $(that.suggestionsContainer),
                 noSuggestionsContainer = $(that.noSuggestionsContainer);

            this.adjustContainerWidth();

            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();

            // clean suggestions if any
            container.empty();
            container.append(noSuggestionsContainer);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container, that.suggestions);
            }

            that.fixPosition();

            container.show();
            that.visible = true;
        },

        adjustContainerWidth: function() {
            var that = this,
                options = that.options,
                width,
                container = $(that.suggestionsContainer);

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            if (options.width === 'auto') {
                width = that.el.outerWidth();
                container.css('width', width > 0 ? width : 300);
            } else if(options.width === 'flex') {
                // Trust the source! Unset the width property so it will be the max length
                // the containing elements.
                container.css('width', '');
            }
        },

        findBestHint: function () {
            var that = this,
                value = that.el.val().toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            $.each(that.suggestions, function (i, suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function (suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || $.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function (suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return $.map(suggestions, function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        validateOrientation: function(orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();

            if($.inArray(orientation, ['auto', 'bottom', 'top']) === -1){
                orientation = fallback;
            }

            return orientation;
        },

        processResponse: function (result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && !result.suggestions.length) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function (index) {
            var that = this,
                activeItem,
                selected = that.classes.selected,
                container = $(that.suggestionsContainer),
                children = container.find('.' + that.classes.suggestion);

            container.find('.' + selected).removeClass(selected);

            that.selectedIndex = index;

            if (that.selectedIndex !== -1 && children.length > that.selectedIndex) {
                activeItem = children.get(that.selectedIndex);
                $(activeItem).addClass(selected);
                return activeItem;
            }

            return null;
        },

        selectHint: function () {
            var that = this,
                i = $.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function (i) {
            var that = this;
            that.hide();
            that.onSelect(i);
        },

        moveUp: function () {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                $(that.suggestionsContainer).children('.' + that.classes.suggestion).first().removeClass(that.classes.selected);
                that.selectedIndex = -1;
                that.ignoreValueChange = false;
                that.el.val(that.currentValue);
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function () {
            var that = this;

            if (that.selectedIndex === (that.suggestions.length - 1)) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function (index) {
            var that = this,
                activeItem = that.activate(index);

            if (!activeItem) {
                return;
            }

            var offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = $(that.suggestionsContainer).scrollTop();
            lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop - that.options.maxHeight + heightDelta);
            }

            if (!that.options.preserveInput) {
                // During onBlur event, browser will trigger "change" event,
                // because value has changed, to avoid side effect ignore,
                // that event, so that correct suggestion can be selected
                // when clicking on suggestion with a mouse
                that.ignoreValueChange = true;
                that.el.val(that.getValue(that.suggestions[index].value));
            }

            that.signalHint(null);
        },

        onSelect: function (index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.el.val() && !that.options.preserveInput) {
                that.el.val(that.currentValue);
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if ($.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function (value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            if (parts.length === 1) {
                return value;
            }

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function () {
            var that = this;
            that.el.off('.autocomplete').removeData('autocomplete');
            $(window).off('resize.autocomplete', that.fixPositionCapture);
            $(that.suggestionsContainer).remove();
        }
    };

    // Create chainable jQuery plugin:
    $.fn.devbridgeAutocomplete = function (options, args) {
        var dataKey = 'autocomplete';
        // If function invoked without argument return
        // instance of the first matched element:
        if (!arguments.length) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new Autocomplete(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };

    // Don't overwrite if it already exists
    if (!$.fn.autocomplete) {
        $.fn.autocomplete = $.fn.devbridgeAutocomplete;
    }
}));