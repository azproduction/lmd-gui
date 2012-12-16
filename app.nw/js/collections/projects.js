var _ = require('_'),
    Backbone = require('Backbone'),
    ProjectModel = require('ProjectModel'),
    BuildsCollection = require('BuildsCollection');

var ProjectsCollection = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: ProjectModel,
    localStorage: new Backbone.LocalStorage('lmd-projects'),

    nextOrder: function () {
        if (!this.length) {
            return 1;
        }
        return this.last().get('order') + 1;
    },

    comparator: function (todo) {
        return todo.get('order');
    }
});

var projects = new ProjectsCollection();

projects.on('destroy', function (project) {
    BuildsCollection.destroyByProjectId(project.id);
});

module.exports = projects;
