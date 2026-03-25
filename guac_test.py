import urllib.request
import urllib.parse
import json
import ssl

# Disable SSL verification for this test
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Set up the request
url = "https://htmlgw3.apponfly.com/rdp/api/session/data/mysql/connectionGroups/ROOT/tree"

headers = {
    "Accept": "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    "guacamole-token": "6E5DA99AED62677008D26045058FCF68B3EB44CBDA836D297F5BE5907AE35DB1",
    "Cookie": "_gcl_au=1.1.1302641859.1772367745; _gid=GA1.2.55854900.1772367745; _gat_gtag_UA_47851850_1=1; _dc_gtm_UA-47851850-1=1; _hjSessionUser_1843527=eyJpZCI6IjFmNDQzMzM4LTgwZjUtNTgxOC04YTY3LWUwOWM4NWQ1M2YxYSIsImNyZWF0ZWQiOjE3NzIzNjc3NDU0NTEsImV4aXN0aW5nIjpmYWxzZX0=; _hjSession_1843527=eyJpZCI6ImM3MzE3ZjYxLTljZWYtNDNiZC05YjM0LWQ0NGIyMmY2NTJjNSIsImMiOjE3NzIzNjc3NDU0NTIsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjoxLCJzcCI6MH0=; _ga=GA1.1.1463384861.1772367745; _ga_69YX9CMFC3=GS2.1.s1772367745$o1$g1$t1772367752$j53$l0$h0; X-Trial-Authentication=f32ed307-c80a-48a7-942f-c603b9a31e24; X-Trial-App=microsoft-windows-vps"
}

req = urllib.request.Request(url, headers=headers, method='GET')

try:
    response = urllib.request.urlopen(req, context=ssl_context)
    data = response.read().decode('utf-8')
    print("Response Status:", response.getcode())
    print("Response Data:", data)
except Exception as e:
    print("Error:", str(e))