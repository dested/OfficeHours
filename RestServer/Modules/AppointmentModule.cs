using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using RestServer.Common;
using RestServer.Common.Nancy;
using RestServer.Data;
using RestServer.Logic;

namespace RestServer.Modules
{
    public class AppointmentModule : BaseModule
    {
        public AppointmentModule() : base("api/appointment")
        {
          
            Post["/schedule"] = _ => this.Success(AppointmentLogic.ScheduleAppointment(ValidateRequest<ScheduleAppointmentRequest>()));
            Get["/{appointmentId}"] = _ => this.Success(AppointmentLogic.GetAppointment(ValidateRequest<GetAppointmentRequest>()));
        }
    }


    public class ScheduleAppointmentRequest
    {
        public string VendorId { get; set; }
        public string MemberId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
    public class GetAppointmentRequest
    {
        public string AppointmentId { get; set; }
    }
    public class GetAppointmentResponse
    {
        public MongoAppointment.Appointment Appointment { get; set; }
    }

    public class ScheduleAppointmentResponse
    {
        [JsonConverter(typeof(StringEnumConverter))]
        [BsonRepresentation(BsonType.String)]
        public ScheduleError Error { get; set; }

        public MongoAppointment.Appointment Appointment { get; set; }
    }

    public enum ScheduleError
    {
        None,
        OutsideOfWindow,
        DoubleBookingMember,
        DoubleBookingVendor,
    }



}