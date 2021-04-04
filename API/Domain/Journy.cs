using System;
using shipments_viz.StateStores;

namespace shipments_viz.Domain
{
    public record Journy(
        Guid Id,
        DateTime Date,
        Location From,
        Location To
    ) : IEntity;
}