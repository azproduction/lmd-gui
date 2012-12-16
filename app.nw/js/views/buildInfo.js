"use strict";
var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    buildInfoTemplate = require('BuildInfoTemplate'),
    ProjectsCollection = require('ProjectsCollection');

var BuildView = Backbone.View.extend({
    tagName: 'div',
    className: 'b-build-info__item',

    template: _.template(buildInfoTemplate),

    events: {
        'click .js-info':       'info',
        'click .js-rebuild':    'rebuild',
        'click .js-watch':      'toggleWatch',
        'click .js-server':     'toggleServer'
    },

    initialize: function () {
        this.model.on('change', this.updateState, this);
        this.model.on('destroy', this.remove, this);
    },

    render: function () {
        var data = this.model.toJSON();
        data.project = ProjectsCollection.get(this.model.get('projectId')).toJSON();
        this.$el.html(this.template(data));

        this.$rebuild = this.$el.find('.js-rebuild');
        this.$watch = this.$el.find('.js-watch');
        this.$server = this.$el.find('.js-server');

        this.updateState();
        return this;
    },

    updateState: function () {
        var isCurrent = this.model.get('isCurrent'),
            isWatching = this.model.get('isWatching'),
            isBuilding = this.model.get('isBuilding'),
            isStats = this.model.get('isStats');

        this.$el.toggleClass('i-hidden', !isCurrent);
        this.$watch.toggleClass('b-action-button_state_active', isWatching);
        this.$server.toggleClass('b-action-button_state_active', isStats);
        this.$rebuild.toggleClass('b-action-button_state_active', isBuilding);
    },

    info: function () {
        console.log(this.model.id, 'info');
    },

    rebuild: function () {
        var self = this,
            isBuilding = this.model.get('isBuilding');

        if (isBuilding) {
            return;
        }

        // mock rebuilding
        this.model.save({
            isBuilding: true
        });
    },

    toggleWatch: function () {
        var isWatching = this.model.get('isWatching');
        this.model.save({
            isWatching: !isWatching
        });
    },

    toggleServer: function () {
        var isStats = this.model.get('isStats');
        this.model.save({
            isStats: !isStats
        });
    }
});

module.exports =  BuildView;
