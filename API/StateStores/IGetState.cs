using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace shipments_viz.StateStores
{
    public interface IGetState<T>
    {
        string ETag { get; }
        Task<T?> Get(Guid id);
        Task<IEnumerable<T>> GetAll();
    }
}