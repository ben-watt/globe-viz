using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using globe_viz.Controllers;
using System.IO;
using globe_viz.StateStores;
using globe_viz.Domain;
using System;

namespace globe_viz
{
    public class Startup
    {
        private readonly IWebHostEnvironment _env;

        public Startup(IWebHostEnvironment env)
        {
            _env = env;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSpaStaticFiles(configuration =>
            {
                if(_env.IsDevelopment())
                {
                    configuration.RootPath = Path.Combine("..", "ui", "public");
                }
                else
                {
                    configuration.RootPath = Path.Combine("..", "ui");
                }
            });

            services.AddTransient<JourneyController>();

            var journeyStore = new InMemoryStateStore<Journy>();
            services.AddSingleton<IGetState<Journy>>(journeyStore);
            services.AddSingleton<IStoreState<Journy>>(journeyStore);

            services.AddTransient<LatLongLookup>();

            services.AddHttpClient("journey-store");
            services.AddHttpClient("geo-names")
                .ConfigureHttpClient(x =>
                {
                    x.BaseAddress = new Uri("http://api.geonames.org/");
                });

            if(_env.IsDevelopment())
            {
                services.AddCors(options =>
                    options.AddDefaultPolicy(pb => {
                        pb.WithExposedHeaders("ETag");
                        pb.AllowAnyHeader();
                        pb.WithOrigins("http://localhost:8080");
                }));
            }
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseCors();
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/api/journeys", app.ApplicationServices.GetRequiredService<JourneyController>().GetJourneys);
                endpoints.MapPost("/api/journy", app.ApplicationServices.GetRequiredService<JourneyController>().SaveJourny);
                endpoints.MapPost("/api/shipment", app.ApplicationServices.GetRequiredService<JourneyController>().SaveShipment);
            });

            app.UseSpaStaticFiles();
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = Path.Combine("..", "ui");

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
