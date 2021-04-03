using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Spectre.Console;
using Spectre.Console.Cli;

namespace CLI
{
    static class Program
    {
        static void Main(string[] args)
        {
            var app = new CommandApp();
            app.Configure(config =>
            {
                config.SetApplicationName("journey-creator");
                config.AddCommand<Create>("create");
            });

            app.Run(args);
        }
    }

    internal class Options : CommandSettings
    {
        [CommandArgument(0, "<count>")]
        public int JourneyCount { get; set; }
    }

    internal class Create : Command<Options>
    {
        private readonly RandomLocation _randomLocation = new (100);

        public override int Execute([NotNull] CommandContext context, [NotNull] Options settings)
        {
            AnsiConsole.Progress()
            .Columns(new ProgressColumn[] {
                new TaskDescriptionColumn(),
                new SpinnerColumn(Spinner.Known.Dots6),
                new ProgressBarColumn(),
                new PercentageColumn(),
            }).StartAsync(async ctx =>
            {
                var task1 = ctx.AddTask("[yellow]Creating Journeys[/]");

                while (!ctx.IsFinished)
                {
                    await CreateJourney();
                    await Task.Delay(1000);
                    task1.Increment(100 / settings.JourneyCount);
                }
            }).GetAwaiter().GetResult();

            return 0;
        }

        private async Task CreateJourney()
        {
            var threeSeconds = new TimeSpan(0, 0, 3);
            var client = new HttpClient()
            {
                BaseAddress = new Uri("http://localhost:5000"),
                Timeout = threeSeconds,
            };

            var journy = new Journy(DateTime.Now, _randomLocation.Next(), _randomLocation.Next());
            await client.PostAsJsonAsync("/journy", journy);
        }

        internal record Journy(
            DateTime Date,
            Location From,
            Location To);

        internal record Location(
            string Name,
            double Longitude,
            double Latitude
        );

        internal class RandomLocation
        {
            private readonly Random _random;
            private readonly List<Location> _locations = new()
            {
                new Location("Manchester", 53.4723271,-2.2936734),
                new Location("Stockport", 53.4175607,-2.184167),
                new Location("San Fransisco", 37.7577627,-122.4727051),
                new Location("Hong Kong", 22.352991,113.9872748),
                new Location("Dubai", 25.3176751,55.4403962),
                new Location("Copenhagen", 55.6713107,12.5587189)
            };

            public RandomLocation(int seed)
            {
                _random = new(seed);
            }

            public Location Next() => _locations[_random.Next(_locations.Count)];
        }
    }
}
