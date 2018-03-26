describe('Constraint Location', function () {

    beforeEach(function () {
        this.server = sinon.fakeServer.create();

        this.$input = $(document.createElement('input')).appendTo(document.body);
        this.instance = this.$input.suggestions({
            serviceUrl: 'service/url',
            type: 'ADDRESS',
            geoLocation: false
        }).suggestions();
    });

    afterEach(function () {
        this.instance.dispose();
        this.$input.remove();
        this.server.restore();
    });

    it('should skip unnecessary fields', function () {
        var location = new $.Suggestions.ConstraintLocation({
            'country': 'Россия',
            'region': 'Самарская',
            'region_type': 'обл',
            'postal_code': '445020',
            'okato': '36440373000'
        }, this.instance);

        expect(location.getFields()).toEqual({
            'country': 'Россия',
            'region': 'Самарская',
            'postal_code': '445020'
        });
    });

    it('should use kladr id if specified', function () {
        var location = new $.Suggestions.ConstraintLocation({
            'city': 'Тольятти',
            'kladr_id': '6300000700000'
        }, this.instance);

        expect(Object.keys(location.getFields())).toEqual(['kladr_id']);
    });

    it('should determine specificity', function () {
        var location = new $.Suggestions.ConstraintLocation({
                'city': 'Тольятти'
            }, this.instance),
            expectedSpecificity = 5;

        expect(this.instance.type.dataComponents[expectedSpecificity].id).toEqual('city');
        expect(location.specificity).toEqual(expectedSpecificity);
    });

    it('should determine specificity of kladr_id', function () {
        var location = new $.Suggestions.ConstraintLocation({
                'kladr_id': '6300000700000'
            }, this.instance),
            expectedSpecificity = 5;

        expect(this.instance.type.dataComponents[expectedSpecificity].id).toEqual('city');
        expect(location.specificity).toEqual(expectedSpecificity);
    });

    it('should determine suggestion data includes', function () {
        var location = new $.Suggestions.ConstraintLocation({
            'country': 'россия',
            'region': 'самарская'
        }, this.instance);

        expect(location.containsData({
            'postal_code': '445000',
            'country': 'Россия',
            'region_fias_id': 'df3d7359-afa9-4aaa-8ff9-197e73906b1c',
            'region_kladr_id': '6300000000000',
            'region_with_type': 'Самарская обл',
            'region_type': 'обл',
            'region_type_full': 'область',
            'region': 'Самарская',
            'city_fias_id': '242e87c1-584d-4360-8c4c-aae2fe90048e',
            'city_kladr_id': '6300000700000',
            'city_with_type': 'г Тольятти',
            'city_type': 'г',
            'city_type_full': 'город',
            'city': 'Тольятти',
            'city_district_with_type': 'Центральный р-н',
            'city_district_type': 'р-н',
            'city_district_type_full': 'район',
            'city_district': 'Центральный',
            'street_fias_id': 'b3631886-22ac-4852-a1cb-c60b222888cf',
            'street_kladr_id': '63000007000028700',
            'street_with_type': 'ул Ленинградская',
            'street_type': 'ул',
            'street_type_full': 'улица',
            'street': 'Ленинградская',
            'fias_id': 'b3631886-22ac-4852-a1cb-c60b222888cf',
            'fias_level': '7',
            'kladr_id': '63000007000028700',
            'capital_marker': '0',
            'okato': '36440373000',
            'oktmo': '36740000',
            'tax_office': '6324',
            'geo_lat': '53.505569',
            'geo_lon': '49.4110871'
        })).toBe(true);
        expect(location.containsData({
            'postal_code': '445000',
            'country': 'Россия',
            'region': null
        })).toBe(false);
    });

    it('should determine suggestion data includes by kladr_id', function () {
        var location = new $.Suggestions.ConstraintLocation({
            'kladr_id': '6300000700000'
        }, this.instance);

        expect(location.containsData({
            'postal_code': '445000',
            'country': 'Россия',
            'region_kladr_id': '6300000000000',
            'region_with_type': 'Самарская обл',
            'city_kladr_id': '6300000700000',
            'city_with_type': 'г Тольятти',
            'city_district_with_type': 'Центральный р-н',
            'street_kladr_id': '63000007000028700',
            'street_with_type': 'ул Ленинградская',
            'fias_id': 'b3631886-22ac-4852-a1cb-c60b222888cf',
            'fias_level': '7',
            'kladr_id': '63000007000028700'
        })).toBe(true);

        // Data without kladr_id
        expect(location.containsData({
            'postal_code': '445000',
            'country': 'Россия',
            'region': 'самарская'
        })).toBe(false);

        // Data with wrong kladr_id
        expect(location.containsData({
            // Some street from Samara
            'kladr_id': '63000001000000100'
        })).toBe(false);
    });

});
