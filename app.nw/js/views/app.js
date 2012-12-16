"use strict";
var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    ProjectsCollection = require('ProjectsCollection'),
    BuildsCollection = require('BuildsCollection'),
    ProjectView = require('ProjectView'),
    BuildInfoView = require('BuildInfoView');

var AppView = Backbone.View.extend({
    el: '.b-layout',

    events: {
        'click .js-add-project':    'addProject',
        'click .js-remove-project':	'removeSelectedProject'
    },

    initialize: function () {
        this.$landingBox = this.$el.find('.b-landing-box');
        this.$projects = this.$el.find('.b-projects');
        this.$buildInfo = this.$el.find('.b-build-info');
        this.$buildInfo.empty();
        this.$gettingStarted = this.$el.find('.b-getting-started');

        this.renderedBuilds = {};

        ProjectsCollection.on('reset remove add', this.updateVisibility, this);
        ProjectsCollection.on('add', this.addOne, this);
        ProjectsCollection.on('reset', this.addAll, this);

        BuildsCollection.on('change:isCurrent', this.addBuildInfo, this);
        BuildsCollection.on('reset', function () {
            // looking for current build/last selected
            var currentBuild = BuildsCollection.where({isCurrent: true});
            if (currentBuild[0]) {
                this.addBuildInfo(BuildsCollection.get(currentBuild[0].id));
            }

            // if no active builds - show getting started
            this.toggleBuildInfo(!!currentBuild[0]);
        }, this);

        BuildsCollection.on('destroy', function (build) {
            if (build.get('isCurrent')) {
                this.toggleBuildInfo(false);
            }
        }, this);
    },

    addProject: function () {
        var project = ProjectsCollection.create({
            name: Math.random() + '',
            location: Math.random() + '/' + Math.random(),
            order: ProjectsCollection.nextOrder()
        });

        _(2).times(function () {
            this.addBuildTo(project.id);
        }, this);
    },

    removeSelectedProject: function () {
        console.log('removeSelectedProject');
    },

    addBuildTo: function (projectId) {
        var build = BuildsCollection.create({
            name: Math.random() + '',
            projectId: projectId,
            isWatching: Math.random() > 0.5,
            isBuilding: Math.random() > 0.5,
            isStats: Math.random() > 0.5
        });

        build.focus();
    },

    updateVisibility: function () {
        this.$landingBox.toggleClass('i-hidden', !!ProjectsCollection.length);
        this.$projects.toggleClass('i-hidden', !ProjectsCollection.length);

        this.toggleBuildInfo(!!ProjectsCollection.length);
    },

    addOne: function(project) {
        var view = new ProjectView({
            model: project
        });

        this.$projects.append(view.render().el);
    },

    addAll: function() {
        this.$projects.empty();
        ProjectsCollection.each(this.addOne, this);
    },

    addBuildInfo: function (build) {
        this.toggleBuildInfo(true);
        // if already rendered do not add twice
        if (this.renderedBuilds[build.id]) {
            return;
        }

        var view = new BuildInfoView({
            model: build
        });

        this.renderedBuilds[build.id] = true;
        this.$buildInfo.append(view.render().el);
    },

    toggleBuildInfo: function (isShow) {
        this.$buildInfo.toggleClass('i-hidden', !isShow);
        this.$gettingStarted.toggleClass('i-hidden', isShow);
    }
});

module.exports = AppView;
