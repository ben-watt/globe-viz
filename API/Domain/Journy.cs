using System;
using System.Linq;
using System.Text.Json.Serialization;
using shipments_viz.StateStores;

namespace shipments_viz.Domain
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

        public Journy(Shipment shipment)
        {
            Id = Guid.NewGuid();
            Date = shipment.ShipmentSummary.Created;

            var origin = shipment.ShipmentSummary.Addresses.First(x => x.AddressType == "Origin");
            var destination = shipment.ShipmentSummary.Addresses.First(x => x.AddressType == "Destination");

            From = new Location(origin.AddressLine1, origin.LatLong.Latitude, origin.LatLong.Longitude);
            To = new Location(destination.AddressLine1, destination.LatLong.Latitude, destination.LatLong.Longitude);
        }

        public Guid Id { get; init; }
        public DateTime Date { get; init; }
        public Location From { get; init; }
        public Location To { get; init; }
    }
}