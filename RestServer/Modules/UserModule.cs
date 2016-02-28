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
    public class UserModule : BaseModule
    {
        public UserModule() : base("api/user")
        {
            Post["/login"] = _ =>
            {
                var model = ValidateRequest<UserLoginRequest>();
                var response = UserLogic.Login(model);
                return this.Success(response, new TokenMetaData(new JwtToken().Encode(new UserJwtModel() { UserId = response.User.Id.ToString() }.ToJwtPayload())));
            };
            Post["/register"] = _ =>
            {
                var model = ValidateRequest<UserRegisterRequest>();
                var response = UserLogic.Register(model);
                return this.Success(response, new TokenMetaData(new JwtToken().Encode(new UserJwtModel() { UserId = response.User.Id.ToString() }.ToJwtPayload())));
            };

            Get["/"] = _ => this.RequiresAuthentication().Success(UserLogic.GetUser(this.JwtModel));
            Get["/vendor/{email}"] = _ => this.Success(UserLogic.GetPublicVendor(this.ValidateRequest<UserGetPublicVendorRequest>()));
            Post["/vendor-availability"] = _ => this.RequiresAuthentication().Success(UserLogic.SetVendorAvailable(ValidateRequest<UserSetVendorAvailableRequest>()));
            Get["/{userId}/vendor-availability"] = _ => this.Success(UserLogic.GetVendorAvailable(ValidateRequest<UserRequest>()));

        }

    }





    public class UserLoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class UserGetPublicVendorRequest
    {
        public string Email { get; set; }
    }

    public class UserGetPublicVendorResponse
    {
        public MongoUser.User User { get; set; }
    }
    public class UserRequest
    {
        public string UserId { get; set; }
    }
    public class UserDetailsResponse
    {
        public MongoUser.User User { get; set; }
    }
    public class VendorAvailabilityResponse
    {
        public MongoUser.VendorSchedule Schedule { get; set; }
        public List<MongoAppointment.DeidentifiedAppointment> Appointments { get; set; }
    }
    public class UserLoginResponse
    {
        public string UserId { get; set; }
        public bool IsVendor { get; set; }
    }
    public class UserRegisterRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public bool IsVendor { get; set; }
    }
    public class UserSetVendorAvailableRequest
    {
        public string VendorId { get; set; }
        public MongoUser.VendorSchedule Schedule { get; set; }
    }

    public class SuccessResponse
    {
        public bool Success { get; set; } = true;
    }

}