using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using shipments_viz.Controllers;

namespace shipments_viz
{
    public class Startup
    {

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "UI/public";
            });

            services.AddTransient<JourneyController>();
            services.AddHttpClient("journy-store");
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseStaticFiles();
            app.UseRouting();
            app.UseCloudEvents();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapSubscribeHandler();

                endpoints.MapGet("/journeys", app.ApplicationServices.GetRequiredService<JourneyController>().GetJourneys);
                endpoints.MapPost("/journy", app.ApplicationServices.GetRequiredService<JourneyController>().SaveJourny);
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "/UI";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
