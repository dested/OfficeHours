using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using RestServer.Common;
using RestServer.Common.Mongo;
using RestServer.Common.Nancy;
using RestServer.Data;
using RestServer.Modules;

namespace RestServer.Logic
{
    public class UserLogic
    {
        public static UserDetailsResponse Login(UserLoginRequest model)
        {
            var hashPassword = PasswordUtils.HashPassword(model.Password);

            var user = MongoUser.Collection.GetOne(a => a.Email == model.Email && a.Password == hashPassword);

            if (user == null)
            {
                throw new RequestValidationException("User not found.");
            }

            return new UserDetailsResponse()
            {
                User = user
            };
        }

        public static UserDetailsResponse Register(UserRegisterRequest model)
        {
            var user = MongoUser.Collection.GetOne(a => a.Email == model.Email);

            if (user != null)
            {
                throw new RequestValidationException("Email Address In Use");
            }

            user = new MongoUser.User();
            user.Email = model.Email;
            user.Password = PasswordUtils.HashPassword(model.Password);
            if (model.IsVendor)
            {
                initializeVendor(user);
            }
            user.Sinch = new MongoUser.SinchData();
            user.Sinch.Password = Guid.NewGuid().ToString("N");
            user.Sinch.Username = Guid.NewGuid().ToString("N");

            user.Insert();

            return new UserDetailsResponse()
            {
                User = user
            };
        }
        public static UserDetailsResponse GetUser(UserJwtModel jwtModel)
        {
            var user = MongoUser.Collection.GetById(jwtModel.UserId);
            return new UserDetailsResponse()
            {
                User = user
            };
        }

        public static SuccessResponse SetVendorAvailable(UserSetVendorAvailableRequest model)
        {
            var vendor = MongoUser.GetVendorById(model.VendorId);
            vendor.Vendor.Schedule = model.Schedule;
            vendor.Update();
            return new SuccessResponse();
        }
        public static VendorAvailabilityResponse GetVendorAvailable(UserRequest model)
        {
            var vendor = MongoUser.GetVendorById(model.UserId);
            var s = vendor.Id.ToString();

            return new VendorAvailabilityResponse()
            {
                Schedule = vendor.Vendor.Schedule,
                Appointments = MongoAppointment.Collection.GetAll(a => a.VendorId == s && a.State != MongoAppointment.AppointmentState.Completed && a.State != MongoAppointment.AppointmentState.Happening).Select(a => new MongoAppointment.DeidentifiedAppointment()
                {
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,

                }).ToList()
            };
        }

        private static void initializeVendor(MongoUser.User user)
        {
            user.Vendor = new MongoUser.Vendor();
            user.Vendor.Schedule = new MongoUser.VendorSchedule();
            user.Vendor.Schedule.Days = new List<MongoUser.VendorScheduleDay>();
            for (int i = 0; i < 7; i++)
            {
                user.Vendor.Schedule.Days.Add(new MongoUser.VendorScheduleDay()
                {
                    DayOfWeek = i,
                    Blocks = new List<MongoUser.VendorScheduleDayBlock>()
                    {
                        new MongoUser.VendorScheduleDayBlock()
                        {
                            StartTime =new DateTime(1987,7,22,0,0,0),
                            EndTime = new DateTime(1987,7,22,23,59,59)
                        }
                    }
                });

            }
            user.Vendor.Schedule.ExceptionDays = new List<MongoUser.ExceptionDay>();
            user.Vendor.Schedule.ExceptionDays.Add(new MongoUser.ExceptionDay()
            {
                Day = new DateTime(1987, 12, 25),
                Reason = "Christmas Day"
            });
        }


        public static UserGetPublicVendorResponse GetPublicVendor(UserGetPublicVendorRequest model)
        {
            var user=MongoUser.Collection.GetOne(a => a.Email == model.Email && a.Vendor != null);

            if (user == null)
            {
                throw new RequestValidationException("Vendor not found");
            }

            return new UserGetPublicVendorResponse()
            {
                User= user
            };

        }
    }
}