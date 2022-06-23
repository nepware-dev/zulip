import bitfield.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("zerver", "0394_alter_realm_want_advertise_in_communities_directory"),
    ]

    operations = [
        migrations.AlterField(
            model_name="realm",
            name="authentication_methods",
            field=bitfield.models.BitField(
                [
                    "Google",
                    "Email",
                    "GitHub",
                    "LDAP",
                    "Dev",
                    "RemoteUser",
                    "AzureAD",
                    "SAML",
                    "GitLab",
                    "Apple",
                    "OpenID Connect",
                    "Mero guru"
                ],
                default=2147483647,
            ),
        ),
    ]
