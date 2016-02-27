using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using RestServer.Common.Mongo;
using RestServer.Common.Nancy;

namespace RestServer.Data
{
    public static class MongoUser
    {
        public static string CollectionName = "user";

        public static IMongoCollection<User> Collection
        {
            get { return MongoTools.GetCollection<User>(); }
        }
        public static IMongoCollection<T> CollectionAs<T>() where T : User
        {
            return MongoTools.GetCollection<T>();
        }
        public static MongoUser.User GetMemberById(string id)
        {
            var user = MongoUser.Collection.GetById(id);

            if (user == null)
            {
                throw new RequestValidationException("Member does not exist");
            }
            return user;
        }

        public static MongoUser.User GetVendorById(string id)
        {
            var user = MongoUser.Collection.GetById(id);
            if (user == null)
            {
                throw new RequestValidationException("Vendor does not exist");
            }
            if (user.Vendor == null)
            {
                throw new RequestValidationException("Member is not a vendor");
            }

            return user;
        }


        [BsonIgnoreExtraElements]
        public class User : IMongoModel
        {
            public ObjectId Id { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
            public bool IsGuest { get; set; }
            public DateTime CreatedDate { get; set; }
            public Vendor Vendor { get; set; }
        }
         
        [BsonIgnoreExtraElements]
        public class Vendor
        {
            public VendorSchedule Schedule { get; set; }
        }

        [BsonIgnoreExtraElements]
        public class VendorSchedule
        {
            public List<VendorScheduleDay> Days { get; set; }
            public List<ExceptionDay> ExceptionDays { get; set; }
        }

        public class ExceptionDay
        {
            public DateTime Day { get; set; }
            public string Reason { get; set; }
        }
        public class VendorScheduleDay
        {
            public int DayOfWeek { get; set; }
            public List<VendorScheduleDayBlock> Blocks { get; set; }
        }
        public class VendorScheduleDayBlock
        {
            public DateTime StartTime { get; set; }
            public DateTime EndTime { get; set; }
        }
    }

}
