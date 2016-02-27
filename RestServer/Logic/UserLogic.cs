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
        public static UserLoginResponse Login(UserLoginRequest model)
        {
            var hashPassword = PasswordUtils.HashPassword(model.Password);

            var user = MongoUser.Collection.GetOne(a => a.Email == model.Email && a.Password == hashPassword);

            if (user == null)
            {
                throw new RequestValidationException("User not found.");
            }

            return new UserLoginResponse()
            {
                UserId = user.Id.ToString()
            };
        }

        public static UserRegisterResponse Register(UserRegisterRequest model)
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
            user.Insert();

            return new UserRegisterResponse()
            {
                UserId = user.Id.ToString()
            };
        }
        public static UserDetailsResponse GetUser(UserRequest model)
        {
            var user = MongoUser.Collection.GetById(model.UserId);

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

        public static ScheduleAppointmentResponse ScheduleAppointment(ScheduleAppointmentRequest model)
        {
            if (model.StartDate > model.EndDate || model.StartDate <= DateTime.UtcNow)
            {
                throw new RequestValidationException("End time cannot be before start time.");
            }

            var userVendor = MongoUser.GetVendorById(model.VendorId);
            var userMember = MongoUser.GetMemberById(model.MemberId);


            var day = userVendor.Vendor.Schedule.Days[(int)model.StartDate.DayOfWeek];
            var dayIsSchedulable = false;
            foreach (var vendorScheduleDayBlock in day.Blocks)
            {
                
                if (fixDate(vendorScheduleDayBlock.StartTime.ToLocalTime(), model.StartDate) <= model.StartDate &&
                    fixDate(vendorScheduleDayBlock.EndTime.ToLocalTime(), model.EndDate) >= model.EndDate)
                {
                    dayIsSchedulable = true;
                }
            }

            if (!dayIsSchedulable)
            {
                return new ScheduleAppointmentResponse()
                {
                    Error = ScheduleError.OutsideOfWindow
                };
            }

            foreach (var memberSchedule in MongoAppointment.Collection.GetAll(a => a.MemberId == model.MemberId))
            {
                if (model.StartDate <= memberSchedule.EndDate.ToLocalTime() && memberSchedule.StartDate.ToLocalTime() <= model.EndDate)
                {
                    return new ScheduleAppointmentResponse()
                    {
                        Error = ScheduleError.DoubleBookingMember
                    };
                }
            }


            foreach (var vendorSchedule in MongoAppointment.Collection.GetAll(a => a.VendorId == model.VendorId))
            {
                if (model.StartDate <= vendorSchedule.EndDate.ToLocalTime() && vendorSchedule.StartDate.ToLocalTime() <= model.EndDate)
                {
                    return new ScheduleAppointmentResponse()
                    {
                        Error = ScheduleError.DoubleBookingVendor
                    };
                }
            }

            MongoAppointment.Appointment appointment = new MongoAppointment.Appointment
            {
                StartDate = model.StartDate,
                EndDate = model.EndDate,
                VendorId = model.VendorId,
                MemberId = model.MemberId,
                State = MongoAppointment.AppointmentState.Scheduled
            };
            appointment.Insert();

            return new ScheduleAppointmentResponse()
            {
                Error = ScheduleError.None,
            };
        }

        private static DateTime fixDate(DateTime toLocalTime, DateTime startDate)
        {
            return new DateTime(startDate.Year, startDate.Month, startDate.Day, toLocalTime.Hour, toLocalTime.Minute, toLocalTime.Second, DateTimeKind.Local);
        }
    }
}