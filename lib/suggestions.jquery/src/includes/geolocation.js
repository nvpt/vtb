    (function() {

        // Disable this feature when GET method used. See SUG-202
        if (utils.getDefaultType() == 'GET') {
            return;
        }

        var locationRequest,
            defaultGeoLocation = true;

        function resetLocation () {
            locationRequest = null;
            Suggestions.defaultOptions.geoLocation = defaultGeoLocation;
        }

        var methods = {

            checkLocation: function () {
                var that = this,
                    providedLocation = that.options.geoLocation;

                if (!that.type.geoEnabled || !providedLocation) {
                    return;
                }

                that.geoLocation = $.Deferred();
                if ($.isPlainObject(providedLocation) || $.isArray(providedLocation)) {
                    that.geoLocation.resolve(providedLocation);
                } else {
                    if (!locationRequest) {
                        locationRequest = $.ajax(that.getAjaxParams('detectAddressByIp'));
                    }

                    locationRequest
                        .done(function (resp) {
                            var locationData = resp && resp.location && resp.location.data;
                            if (locationData && locationData.kladr_id) {
                                that.geoLocation.resolve(locationData);
                            } else {
                                that.geoLocation.reject();
                            }
                        })
                        .fail(function(){
                            that.geoLocation.reject();
                        });
                }
            },

            /**
             * Public method to get `geoLocation` promise
             * @returns {$.Deferred}
             */
            getGeoLocation: function () {
                return this.geoLocation;
            },

            constructParams: function () {
                var that = this,
                    params = {};

                if (that.geoLocation && $.isFunction(that.geoLocation.promise) && that.geoLocation.state() == 'resolved') {
                    that.geoLocation.done(function (locationData) {
                        params['locations_boost'] = $.makeArray(locationData);
                    });
                }

                return params;
            }

        };

        $.extend(defaultOptions, {
            geoLocation: defaultGeoLocation
        });

        $.extend(Suggestions, {
            resetLocation: resetLocation
        });

        $.extend(Suggestions.prototype, {
            getGeoLocation: methods.getGeoLocation
        });

        notificator
            .on('setOptions', methods.checkLocation)
            .on('requestParams', methods.constructParams);

    }());