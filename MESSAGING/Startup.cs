using DotNetCore.CAP;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Savorboard.CAP.InMemoryMessageQueue;
using System;

namespace messaging_sidecar
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCap(x =>
            {
                x.UseInMemoryStorage();
                x.UseInMemoryMessageQueue();
            });

            services.AddHttpClient("app", x =>
            {
                // Create a default client which will point to the relevant application
                var appPort = "5000";
                x.BaseAddress = new Uri($"http://localhost:{appPort}");
                x.Timeout = new TimeSpan(0, 1, 10);
            });

            services.AddTransient<ICapSubscribe, MessageHandler>();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IServiceProvider services)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                // Handles messages from the sidecar application to service bus
                endpoints.MapPost("/v1/message-outbound", async context =>
                {
                    var capPublisher = services.GetRequiredService<ICapPublisher>();
                    await capPublisher.PublishAsync("servicebus.outbound.message", context.Request.Body);
                });
            });
        }
    }
}
