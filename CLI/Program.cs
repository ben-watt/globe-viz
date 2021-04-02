using System;
using Spectre.Console;

namespace CLI
{
    static class Program
    {
        static void Main(string[] args)
        {
            AnsiConsole.Markup("[underline red]Hello World![/]");
        }
    }
}
