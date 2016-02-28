using System;
using System.Collections.Generic;
using MongoDB.Driver;
using Nancy.Hosting.Self;
using RestServer.Common.Mongo;
using Sinch.ServerSdk;
using MongoUser = RestServer.Data.MongoUser;

namespace RestServer
{
    class Program
    {
        static void Main(string[] args)
        {

            var uri =
                new Uri("http://localhost:4545");
            HostConfiguration hostConfigs = new HostConfiguration();
            hostConfigs.UrlReservations.CreateAutomatically = true;
            using (var host = new NancyHost(uri,new Bootstrapper(), hostConfigs))
            {
                host.Start();

                Console.WriteLine("Your application is running on " + uri);
                Console.WriteLine("Press any [Enter] to close the host.");
                Console.ReadLine();
            }
        }
    }
}
