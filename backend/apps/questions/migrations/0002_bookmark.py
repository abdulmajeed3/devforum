import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Bookmark',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('author', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='bookmarks',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('question', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='bookmarks',
                    to='questions.question',
                )),
            ],
            options={
                'db_table': 'questions_bookmark',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='bookmark',
            constraint=models.UniqueConstraint(fields=['author', 'question'], name='unique_bookmark'),
        ),
        migrations.AddIndex(
            model_name='bookmark',
            index=models.Index(fields=['author', '-created_at'], name='questions_bookmark_author_created_idx'),
        ),
    ]
