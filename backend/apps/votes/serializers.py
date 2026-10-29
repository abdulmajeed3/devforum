from rest_framework import serializers


class VoteSerializer(serializers.Serializer):
    value = serializers.ChoiceField(choices=[1, -1])
