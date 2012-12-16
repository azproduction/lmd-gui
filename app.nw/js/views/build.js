"use strict";
var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    buildTemplate = require('BuildTemplate');

var BuildView = Backbone.View.extend({
    tagName: 'li',
    className: 'b-projects__list__item',

    template: _.template(buildTemplate),

    events: {
        'click': 'focusBuild'
    },

    initialize: function () {
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);

        // TODO Move out of this View
        this.model.on('change:isBuilding', this.lmdRebuild, this);
        this.model.on('change:isWatching', this.lmdSetWatch, this);
        this.model.on('change:isStats', this.lmdSetStats, this);
    },

    render: function () {
        var isCurrent = this.model.get('isCurrent');
        this.$el.toggleClass('b-projects__list__item_state_current', isCurrent);

        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    focusBuild: function () {
        this.model.focus();
    },

    // TODO Move out of this View
    lmdRebuild: function (build) {
        if (!build.get('isBuilding')) {
            return;
        }

        setTimeout(function () {
            build.save({
                isBuilding: false
            });
        }, 1000);
    },

    // TODO Move out of this View
    lmdSetWatch: function () {
        if (this.model.get('isWatching')) {
            this.lmdStartWatch();
        } else {
            this.lmdStopWatch();
        }
    },

    // TODO Move out of this View
    lmdStartWatch: function () {
        console.log('lmdStartWatch');
    },

    // TODO Move out of this View
    lmdStopWatch: function () {
        console.log('lmdStopWatch');
    },

    // TODO Move out of this View
    lmdSetStats: function (build) {
        if (this.model.get('isStats')) {
            this.lmdStartStats();
        } else {
            this.lmdStopStats();
        }
    },

    // TODO Move out of this View
    lmdStartStats: function () {
        console.log('lmdStartStats');
    },

    // TODO Move out of this View
    lmdStopStats: function () {
        console.log('lmdStopStats');
    }
});

module.exports =  BuildView;
