﻿using System;
using System.Linq.Expressions;
using MongoDB.Bson;
using MongoDB.Driver;

namespace RestServer.Common.Mongo
{
    public static class MongoQueryUtils
    {
        public static T GetById<T>(this IMongoCollection<T> collection, string id) where T : IMongoModel
        {
            var objectId = new ObjectId(id);
            return collection.Find<T>(a => a.Id == objectId).FirstOrDefault();
        }

        public static T GetOne<T>(this IMongoCollection<T> collection, Expression<Func<T, bool>> expression)
        {
            return collection.Find<T>(expression).FirstOrDefault();
        }


        public static T[] GetAll<T>(this IMongoCollection<T> collection, Expression<Func<T, bool>> expression)
        {
            return collection.Find<T>(expression).ToList().ToArray();
        }

        public static T[] GetAll<T>(this IMongoCollection<T> collection)
        {
            return collection.Find<T>(a => true).ToList().ToArray();
        }

        public static long Count<T>(this IMongoCollection<T> collection, Expression<Func<T, bool>> expression)
        {
            return collection.Find<T>(expression).Count();
        }

        public static T Insert<T>(this T item) where T : IMongoModel
        {
            var collection = MongoTools.GetCollection<T>();
            collection.InsertOne(item);
            return item;
        }

        public static T Update<T>(this T item) where T : IMongoModel
        {
            var collection = MongoTools.GetCollection<T>();
            collection.ReplaceOne(a => a.Id == item.Id, item);
            return item;
        }

        public static void Delete<T>(this string id) where T : IMongoModel
        {
            var collection = MongoTools.GetCollection<T>();
            var oid = new ObjectId(id);
            collection.DeleteOne(a => a.Id == oid);
        }

        public static void Delete<T>(this T item) where T : IMongoModel
        {
            var collection = MongoTools.GetCollection<T>();
            var oid = item.Id;
            collection.DeleteOne(a => a.Id == oid);
        }
    }
}