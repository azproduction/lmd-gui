var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    BuildsCollection = require('BuildsCollection'),
    projectTemplate = require('ProjectTemplate'),

    BuildView = require('BuildView');

var TodoView = Backbone.View.extend({
    tagName:  'div',

    template: _.template(projectTemplate),

    events: {
        'click .js-eject': 'removeProject'
    },

    initialize: function () {
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);

        BuildsCollection.on('reset', this.renderAllBuilds, this);
        BuildsCollection.on('add', this.renderOneBuild, this);
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.$builds = this.$el.find('.b-projects__list');
        return this;
    },

    renderOneBuild: function (build) {
        if (build.get('projectId') !== this.model.id) return;

        var view = new BuildView({
            model: build
        });

        this.$builds.append(view.render().el);
    },

    renderAllBuilds: function () {
        this.$builds.empty();

        BuildsCollection.each(this.renderOneBuild, this);
    },

    removeProject: function () {
        this.model.destroy();
    }
});

module.exports =  TodoView;
