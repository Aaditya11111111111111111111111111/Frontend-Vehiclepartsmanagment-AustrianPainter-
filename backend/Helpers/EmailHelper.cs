using MailKit.Net.Smtp;
using MimeKit;

namespace VehiclePartsAPI.Helpers;

public class EmailHelper
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailHelper> _logger;

    public EmailHelper(IConfiguration config, ILogger<EmailHelper> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _config["Email:SenderName"] ?? "Vehicle Parts System",
                _config["Email:SenderEmail"] ?? "noreply@vehicleparts.com"));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _config["Email:SmtpHost"] ?? "smtp.gmail.com",
                int.Parse(_config["Email:SmtpPort"] ?? "587"),
                MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(
                _config["Email:Username"],
                _config["Email:Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
        }
    }

    public string BuildInvoiceEmailHtml(string customerName, string invoiceNumber, decimal total)
    {
        return $"""
            <html><body style="font-family:Arial,sans-serif;padding:20px;">
            <h2 style="color:#1a73e8;">Vehicle Parts - Invoice #{invoiceNumber}</h2>
            <p>Dear {customerName},</p>
            <p>Thank you for your purchase. Please find your invoice details below.</p>
            <p><strong>Invoice Number:</strong> {invoiceNumber}</p>
            <p><strong>Total Amount:</strong> NPR {total:N2}</p>
            <p>For any queries, please contact us at support@vehicleparts.com</p>
            <br/><p>Best regards,<br/>Vehicle Parts & Service Center</p>
            </body></html>
            """;
    }
}
