using System;

namespace shipments_viz.StateStores
{
    public interface IEntity
    {
        Guid Id { get; }
    }
}