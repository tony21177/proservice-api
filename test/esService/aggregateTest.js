const eventService = require('../../datastore/elasticsearch/event')



const result = eventService.termAggregate("IAMessage.Detail.Info.Category","2021-10-24","2021-12-27");
