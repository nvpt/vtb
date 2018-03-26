    (function(){
        /**
         * Methods related to suggestions dropdown list
         */

        function highlightMatches(chunks) {
            return $.map(chunks, function (chunk) {
                var text = utils.escapeHtml(chunk.text);

                if (text && chunk.matched) {
                    text = '<strong>' + text + '</strong>';
                }
                return text;
            }).join('');
        }

        function nowrapLinkedParts(formattedStr, nowrapClass) {
            var delimitedParts = formattedStr.split(', ');
            // string has no delimiters, should not wrap
            if (delimitedParts.length === 1) {
                return formattedStr;
            }
            // disable word-wrap inside delimited parts
            return $.map(delimitedParts, function (part) {
                return '<span class="' + nowrapClass + '">' + part + '</span>'
            }).join(', ');
        }

        function hasAnotherSuggestion (suggestions, suggestion) {
            var result = false;

            $.each(suggestions, function (i, s) {
                result = s.value == suggestion.value && s != suggestion;
                if (result) {
                    return false;
                }
            });

            return result;
        }

        var optionsUsed = {
            width: 'auto',
            floating: false
        };

        var methods = {

            createContainer: function () {
                var that = this,
                    suggestionSelector = '.' + that.classes.suggestion,
                    options = that.options,
                    $container = $('<div/>')
                        .addClass(options.containerClass)
                        .css({
                            position: 'absolute',
                            display: 'none'
                        });

                that.$container = $container;

                $container.on('click' + eventNS, suggestionSelector, $.proxy(that.onSuggestionClick, that));
            },

            removeContainer: function () {
                var that = this;

                if (that.options.floating) {
                    that.$container.remove();
                }
            },

            setContainerOptions: function () {
                var that = this,
                    mousedownEvent = 'mousedown' + eventNS;

                that.$container.off(mousedownEvent);
                if (that.options.floating) {
                    that.$container.on(mousedownEvent, $.proxy(that.onMousedown, that));
                }
            },

            /**
             * Listen for click event on suggestions list:
             */
            onSuggestionClick: function (e) {
                var that = this,
                    $el = $(e.target),
                    index;

                if (!that.dropdownDisabled) {
                    that.cancelFocus = true;
                    that.el.focus();

                    while ($el.length && !(index = $el.attr('data-index'))) {
                        $el = $el.closest('.' + that.classes.suggestion);
                    }

                    if (index && !isNaN(index)) {
                        that.select(+index);
                    }
                }
            },

            // Dropdown UI methods

            setDropdownPosition: function (origin, elLayout) {
                var that = this,
                    scrollLeft = that.$viewport.scrollLeft(),
                    style;

                if (that.isMobile) {
                    style = that.options.floating ? {
                        left: scrollLeft + 'px',
                        top: elLayout.top + elLayout.outerHeight + 'px'
                    } : {
                        left: origin.left - elLayout.left + scrollLeft + 'px',
                        top: origin.top + elLayout.outerHeight + 'px'
                    };
                    style.width = that.$viewport.width() + 'px';
                } else {
                    style = that.options.floating ? {
                        left: elLayout.left + 'px',
                        top: elLayout.top + elLayout.borderTop + elLayout.innerHeight + 'px'
                    } : {
                        left: origin.left + 'px',
                        top: origin.top + elLayout.borderTop + elLayout.innerHeight + 'px'
                    };

                    // Defer to let body show scrollbars
                    utils.delay(function () {
                        var width = that.options.width;

                        if (width === 'auto') {
                            width = that.el.outerWidth();
                        }
                        that.$container.outerWidth(width);
                    });
                }

                that.$container
                    .toggleClass(that.classes.mobile, that.isMobile)
                    .css(style);

                that.containerItemsPadding = elLayout.left + elLayout.borderLeft + elLayout.paddingLeft - scrollLeft;
            },

            setItemsPositions: function () {
                var that = this,
                    $items = that.getSuggestionsItems();

                $items.css('paddingLeft', that.isMobile ? that.containerItemsPadding + 'px' : '');
            },

            getSuggestionsItems: function () {
                return this.$container.children('.' + this.classes.suggestion);
            },

            toggleDropdownEnabling: function (enable) {
                this.dropdownDisabled = !enable;
                this.$container.attr('disabled', !enable);
            },

            disableDropdown: function () {
                this.toggleDropdownEnabling(false);
            },

            enableDropdown: function () {
                this.toggleDropdownEnabling(true);
            },

            /**
             * Shows if there are any suggestions besides currently selected
             * @returns {boolean}
             */
            hasSuggestionsToChoose: function () {
                var that = this;

                return that.suggestions.length > 1 ||
                    (that.suggestions.length === 1 &&
                        (!that.selection || $.trim(that.suggestions[0].value) !== $.trim(that.selection.value))
                    );
            },

            suggest: function () {
                var that = this,
                    options = that.options,
                    formatResult, html;

                if (!that.requestMode.userSelect) {
                    return ;
                }

                if (!that.hasSuggestionsToChoose()) {
                    that.hide();
                    return;
                }

                formatResult = options.formatResult || that.type.formatResult || that.formatResult;
                html = [];

                // Build hint html
                if (!that.isMobile && options.hint && that.suggestions.length) {
                    html.push('<div class="' + that.classes.hint + '">' + options.hint + '</div>');
                }
                that.selectedIndex = -1;
                // Build suggestions inner HTML:
                $.each(that.suggestions, function (i, suggestion) {
                    var labels = that.makeSuggestionLabel(that.suggestions, suggestion);

                    if (suggestion == that.selection) {
                        that.selectedIndex = i;
                    }

                    html.push('<div class="' + that.classes.suggestion + '" data-index="' + i + '">');
                    html.push(formatResult.call(that, suggestion.value, that.currentValue, suggestion, {
                        unformattableTokens: that.type.unformattableTokens
                    }));
                    if (labels) {
                        html.push('<span class="' + that.classes.subtext_label + '">' + utils.escapeHtml(labels) + '</span>');
                    }
                    html.push('</div>');
                });

                that.$container.html(html.join(''));

                // Select first value by default:
                if (options.autoSelectFirst && that.selectedIndex === -1) {
                    that.selectedIndex = 0;
                }
                if (that.selectedIndex !== -1) {
                    that.getSuggestionsItems().eq(that.selectedIndex).addClass(that.classes.selected);
                }

                if ($.isFunction(options.beforeRender)) {
                    options.beforeRender.call(that.element, that.$container);
                }

                that.$container.show();
                that.visible = true;
                that.fixPosition();
                that.setItemsPositions();
            },

            wrapFormattedValue: function (value, suggestion) {
                var that = this,
                    status = utils.getDeepValue(suggestion.data, 'state.status');

                return '<span class="' + that.classes.value + '"' + (status ? ' data-suggestion-status="' + status + '"' : '') + '>' +
                    value +
                    '</span>';
            },

            formatResult: function (value, currentValue, suggestion, options) {
                var that = this;

                value = that.highlightMatches(value, currentValue, suggestion, options);

                return that.wrapFormattedValue(value, suggestion);
            },

            /**
             * Makes HTML contents for suggestion item
             * @param {String} value string to be displayed as a value
             * @param {String} currentValue contents of the textbox
             * @param suggestion whole suggestion object with displaying value and other fields
             * @param {Object} [options] set of flags:
             *          `unformattableTokens` - array of search tokens, that are not to be highlighted
             *          `maxLength` - if set, `value` is limited by this length
             * @returns {String} HTML to be inserted in the list
             */
            highlightMatches: function (value, currentValue, suggestion, options) {

                var that = this,
                    chunks = [],
                    unformattableTokens = options && options.unformattableTokens,
                    maxLength = options && options.maxLength,
                    tokens, tokenMatchers,
                    rWords = utils.reWordExtractor(),
                    match, word, i, chunk, formattedStr;

                if (!value) return '';

                tokens = utils.formatToken(currentValue).split(wordSplitter);
                tokens = utils.withSubTokens(tokens);

                tokenMatchers = $.map(tokens, function (token) {
                    return new RegExp('^((.*)([' + wordPartsDelimiters + ']+))?' +
                        '(' + utils.escapeRegExChars(token) + ')' +
                        '([^' + wordPartsDelimiters + ']*[' + wordPartsDelimiters + ']*)', 'i');
                });

                // parse string by words
                while ((match = rWords.exec(value)) && match[0]) {
                    word = match[1];
                    chunks.push({
                        text: word,
                        inUpperCase: word.toLowerCase() !== word,
                        formatted: utils.formatToken(word),
                        matchable: true
                    });
                    if (match[2]) {
                        chunks.push({
                            text: match[2]
                        });
                    }
                }

                // use simple loop because length can change
                for (i = 0; i < chunks.length; i++) {
                    chunk = chunks[i];
                    if (chunk.matchable && !chunk.matched && ($.inArray(chunk.formatted, unformattableTokens) === -1 || chunk.inUpperCase)) {
                        $.each(tokenMatchers, function (j, matcher) {
                            var tokenMatch = matcher.exec(chunk.formatted),
                                length, nextIndex = i + 1;

                            if (tokenMatch) {
                                tokenMatch = {
                                    before: tokenMatch[1] || '',
                                    beforeText: tokenMatch[2] || '',
                                    beforeDelimiter: tokenMatch[3] || '',
                                    text: tokenMatch[4] || '',
                                    after: tokenMatch[5] || ''
                                };

                                if (tokenMatch.before) {
                                    // insert chunk before current
                                    chunks.splice(i, 0, {
                                        text: chunk.text.substr(0, tokenMatch.beforeText.length),
                                        formatted: tokenMatch.beforeText,
                                        matchable: true
                                    }, {
                                        text: tokenMatch.beforeDelimiter
                                    });
                                    nextIndex += 2;

                                    length = tokenMatch.before.length;
                                    chunk.text = chunk.text.substr(length);
                                    chunk.formatted = chunk.formatted.substr(length);
                                    i--;
                                }

                                length = tokenMatch.text.length + tokenMatch.after.length;
                                if (chunk.formatted.length > length) {
                                    chunks.splice(nextIndex, 0, {
                                        text: chunk.text.substr(length),
                                        formatted: chunk.formatted.substr(length),
                                        matchable: true
                                    });
                                    chunk.text = chunk.text.substr(0, length);
                                    chunk.formatted = chunk.formatted.substr(0, length);
                                }

                                if (tokenMatch.after) {
                                    length = tokenMatch.text.length;
                                    chunks.splice(nextIndex, 0, {
                                        text: chunk.text.substr(length),
                                        formatted: chunk.formatted.substr(length)
                                    });
                                    chunk.text = chunk.text.substr(0, length);
                                    chunk.formatted = chunk.formatted.substr(0, length);
                                }
                                chunk.matched = true;
                                return false;
                            }
                        });
                    }
                }

                if (maxLength) {
                    for (i = 0; i < chunks.length && maxLength >= 0; i++) {
                        chunk = chunks[i];
                        maxLength -= chunk.text.length;
                        if (maxLength < 0) {
                            chunk.text = chunk.text.substr(0, chunk.text.length + maxLength) + '...';
                        }
                    }
                    chunks.length = i;
                }

                formattedStr = highlightMatches(chunks);
                return nowrapLinkedParts(formattedStr, that.classes.nowrap);
            },

            makeSuggestionLabel: function (suggestions, suggestion) {
                var that = this,
                    fieldNames = that.type.fieldNames,
                    nameData = {},
                    rWords = utils.reWordExtractor(),
                    match, word,
                    labels = [];

                if (fieldNames && hasAnotherSuggestion(suggestions, suggestion) && suggestion.data) {

                    $.each(fieldNames, function (field) {
                        var value = suggestion.data[field];
                        if (value) {
                            nameData[field] = utils.formatToken(value);
                        }
                    });

                    if (!$.isEmptyObject(nameData)) {
                        while ((match = rWords.exec(utils.formatToken(suggestion.value))) && (word = match[1])) {
                            $.each(nameData, function (i, value) {
                                if (value == word) {
                                    labels.push(fieldNames[i]);
                                    delete nameData[i];
                                    return false;
                                }
                            });
                        }

                        if (labels.length) {
                            return labels.join(', ');
                        }
                    }
                }
            },

            hide: function () {
                var that = this;
                that.visible = false;
                that.selectedIndex = -1;
                that.$container
                    .hide()
                    .empty();
            },

            activate: function (index) {
                var that = this,
                    $activeItem,
                    selected = that.classes.selected,
                    $children;

                if (!that.dropdownDisabled) {
                    $children = that.getSuggestionsItems();

                    $children.removeClass(selected);

                    that.selectedIndex = index;

                    if (that.selectedIndex !== -1 && $children.length > that.selectedIndex) {
                        $activeItem = $children.eq(that.selectedIndex);
                        $activeItem.addClass(selected);
                        return $activeItem;
                    }
                }

                return null;
            },

            deactivate: function (restoreValue) {
                var that = this;

                if (!that.dropdownDisabled) {
                    that.selectedIndex = -1;
                    that.getSuggestionsItems().removeClass(that.classes.selected);
                    if (restoreValue) {
                        that.el.val(that.currentValue);
                    }
                }
            },

            moveUp: function () {
                var that = this;

                if (that.dropdownDisabled) {
                    return;
                }
                if (that.selectedIndex === -1) {
                    if (that.suggestions.length) {
                        that.adjustScroll(that.suggestions.length - 1);
                    }
                    return;
                }

                if (that.selectedIndex === 0) {
                    that.deactivate(true);
                    return;
                }

                that.adjustScroll(that.selectedIndex - 1);
            },

            moveDown: function () {
                var that = this;

                if (that.dropdownDisabled) {
                    return;
                }
                if (that.selectedIndex === (that.suggestions.length - 1)) {
                    that.deactivate(true);
                    return;
                }

                that.adjustScroll(that.selectedIndex + 1);
            },

            adjustScroll: function (index) {
                var that = this,
                    $activeItem = that.activate(index),
                    itemTop,
                    itemBottom,
                    scrollTop = that.$container.scrollTop(),
                    containerHeight;

                if (!$activeItem || !$activeItem.length) {
                    return;
                }

                itemTop = $activeItem.position().top;
                if (itemTop < 0 ) {
                    that.$container.scrollTop(scrollTop + itemTop);
                } else {
                    itemBottom = itemTop + $activeItem.outerHeight();
                    containerHeight = that.$container.innerHeight();
                    if (itemBottom > containerHeight) {
                        that.$container.scrollTop(scrollTop - containerHeight + itemBottom);
                    }
                }

                that.el.val(that.suggestions[index].value);
            }

        };

        $.extend(defaultOptions, optionsUsed);

        $.extend(Suggestions.prototype, methods);

        notificator
            .on('initialize', methods.createContainer)
            .on('dispose', methods.removeContainer)
            .on('setOptions', methods.setContainerOptions)
            .on('fixPosition', methods.setDropdownPosition)
            .on('fixPosition', methods.setItemsPositions)
            .on('assignSuggestions', methods.suggest);

    }());