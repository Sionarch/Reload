define([
   'underscore',
   'backbone',
   'models/project/project'
], function(_, Backbone, ProjectModel){

    var ExampleCollection = Backbone.Collection.extend({

        model: ProjectModel,

        initialize: function () {
            _.bindAll(this, 'populate');
            this.populate();
        },

        populate: function () {
            var self = this;
            // Populate with records.
            var options     = {};
            options.url     = 'http://localhost:8283';
            options.rpcMsg  = {
                method: 'manager.getExampleList',
                params: [],
                id:     null
            };

            options.success = function (resp) {
                _.map(resp.result.feed, function (p) {
                    self.push(new ProjectModel(p));
                });
            };

            options.error   = function (resp) {
                console.log('Could not get example list');
                console.log(resp);
            };

            this.rpc(options);
        },
    });

    return ExampleCollection;
});
