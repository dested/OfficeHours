using System;
using RestServer.Common.Mongo;
using RestServer.Common.Nancy;
using RestServer.Data;
using Sinch.ServerSdk;

namespace RestServer.Modules
{
    public static class AppointmentLogic
    {
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

            scheduleAppointment(userVendor,userMember,model);

            return new ScheduleAppointmentResponse()
            {
                Error = ScheduleError.None,
            };
        }

        private static void scheduleAppointment(MongoUser.User userVendor, MongoUser.User userMember, ScheduleAppointmentRequest model)
        {
            MongoAppointment.Appointment appointment = new MongoAppointment.Appointment
            {
                StartDate = model.StartDate,
                EndDate = model.EndDate,
                VendorId = model.VendorId,
                MemberId = model.MemberId,
                State = MongoAppointment.AppointmentState.Scheduled
            };
            appointment.Insert();
        }

 
        private static DateTime fixDate(DateTime toLocalTime, DateTime startDate)
        {
            return new DateTime(startDate.Year, startDate.Month, startDate.Day, toLocalTime.Hour, toLocalTime.Minute, toLocalTime.Second, DateTimeKind.Local);
        }
    }
}