var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    ProjectsCollection = require('ProjectsCollection'),
    BuildsCollection = require('BuildsCollection'),
    ProjectView = require('ProjectView');

var SidebarView = Backbone.View.extend({
    el: '.b-sidebar',

    // template: _.template( statsTemplate ),

    events: {
        'click .js-add-project':    'addProject',
        'click .js-remove-project':	'removeSelectedProject'
    },

    initialize: function () {
        this.$landingBox = this.$el.find('.b-landing-box');
        this.$projects = this.$el.find('.b-projects');

        ProjectsCollection.on('reset remove add destroy', this.updateVisibility, this);
        ProjectsCollection.on('add', this.addOne, this);
        ProjectsCollection.on('reset', this.addAll, this);
    },

    addProject: function () {
        var project = ProjectsCollection.create({
            name: Math.random() + '',
            location: Math.random() + '',
            order: ProjectsCollection.nextOrder()
        });

        _(2).times(function () {
            this.addBuildTo(project.id);
        }, this);
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

    removeSelectedProject: function () {
        console.log('removeSelectedProject');
    },

    updateVisibility: function () {
        this.$landingBox.toggleClass('i-hidden', !!ProjectsCollection.length);
        this.$projects.toggleClass('i-hidden', !ProjectsCollection.length);
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
    }
});

module.exports = SidebarView;
