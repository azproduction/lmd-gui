var $ = require('$'),
    _ = require('_'),
    Backbone = require('Backbone'),
    buildTemplate = require('BuildTemplate');

var BuildView = Backbone.View.extend({
    tagName: 'li',

    template: _.template(buildTemplate),

    events: {
        'click': 'focusBuild'
    },

    initialize: function () {
        this.$el.addClass('b-projects__list__item');
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
    },

    render: function () {
        var isCurrent = this.model.get('isCurrent');
        this.$el.toggleClass('b-projects__list__item_state_current', isCurrent);

        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    focusBuild: function () {
        this.model.focus();
    }
});

module.exports =  BuildView;
