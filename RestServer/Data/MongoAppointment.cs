using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using RestServer.Common.Mongo;
using RestServer.Common.Nancy;

namespace RestServer.Data
{
    public static class MongoAppointment
    {
        public static string CollectionName = "appointment";

        public static IMongoCollection<Appointment> Collection
        {
            get { return MongoTools.GetCollection<Appointment>(); }
        }
        public static IMongoCollection<T> CollectionAs<T>() where T : Appointment
        {
            return MongoTools.GetCollection<T>();
        }

        [BsonIgnoreExtraElements]
        public class Appointment : IMongoModel
        {
            public ObjectId Id { get; set; }
            public string VendorId { get; set; }
            public string MemberId { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }

            [JsonConverter(typeof(StringEnumConverter))]
            [BsonRepresentation(BsonType.String)]
            public AppointmentState State { get; set; }

            public string MemberSinchUsername { get; set; }
            public string VendorSinchUsername { get; set; }
            public string Url { get; set; }
        }

        [BsonIgnoreExtraElements]
        public class DeidentifiedAppointment  
        {
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
        }

        public enum AppointmentState
        {
            Scheduled,
            Happening,
            Completed
        }

    }

}
