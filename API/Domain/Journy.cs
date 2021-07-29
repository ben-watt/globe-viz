using System;
using System.Linq;
using System.Text.Json.Serialization;
using globe_viz.StateStores;

namespace globe_viz.Domain
{
    public record Journy : IEntity
    {
        [JsonConstructor]
        public Journy(Guid id, DateTime date, Location from, Location to)
        {
            Id = id;
            Date = date;
            From = from;
            To = to;
        }

        public Guid Id { get; init; }
        public DateTime Date { get; init; }
        public Location From { get; init; }
        public Location To { get; init; }
    }
}