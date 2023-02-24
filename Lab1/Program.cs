var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseStaticFiles();

app.MapGet("/", async (HttpContext ctx) =>
{
    var pagePath = "wwwroot/html/index.html";
    if (File.Exists(pagePath))
    {
        ctx.Response.Headers.ContentType = new Microsoft.Extensions.Primitives.StringValues("text/html; charset=UTF-8");
        await ctx.Response.SendFileAsync(pagePath);
    }
    else
        ctx.Response.StatusCode = 404;

});

app.Run();
