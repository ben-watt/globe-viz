using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using shipments_viz.Controllers;
using System.IO;

namespace shipments_viz
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = Path.Combine("..", "UI", "public");
            });

            services.AddTransient<JourneyController>();
            services.AddHttpClient("journey-store");

            // Only added to the pipeline in development environments
            services.AddCors(options =>
                options.AddDefaultPolicy(pb =>
                pb.WithOrigins("http://localhost:8080")));
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseCors();
                app.UseDeveloperExceptionPage();
            }

            app.UseStaticFiles();
            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/journeys", app.ApplicationServices.GetRequiredService<JourneyController>().GetJourneys);
                endpoints.MapPost("/journy", app.ApplicationServices.GetRequiredService<JourneyController>().SaveJourny);
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = Path.Combine("..", "UI");

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
